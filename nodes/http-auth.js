const crypto = require('crypto');

const sessions = {};

function basicAuth(authStr, node, msg) {
	const values = new Buffer(authStr, 'base64').toString().split(':');
	const username = values[0];
	const password = values[1];
	const user = node.httpauthconf.getUser(node.httpauthconf.realm, username);

	if (user && password == user.password) {
		node.send(msg);
	} else {
		unAuth(node, msg);
	}
}

function digestAuth(authStr, node, msg) {
	const values = authStr.split(', ');
	let method = msg.req.route.method;

	// Bluemix workaround
	if (!method && msg.req.route.methods) {
		for (const _method in msg.req.route.methods) {
			if (!method && msg.req.route.methods[_method]) {
				method = _method;
			}
		}
	}

	const auth = { method: method.toUpperCase() };

	for (let index = 0; index < values.length; index++) {
		const value = values[index].trim();
		const prop = value.match(/^\w+\b/)[0].toLowerCase();
		auth[prop] = value.substring(prop.length + 1);
		auth[prop] = auth[prop].search('"') == 0 ? auth[prop].substring(1, auth[prop].length - 1) : auth[prop];
	}

	const user = node.httpauthconf.getUser(auth.realm, auth.username);
	const session = sessions[auth.nonce + auth.opaque];

	if (user && session) {
		let ha1 = null;

		if (user.hashed) {
			ha1 = user.password;
		} else {
			const hash = crypto.createHash('md5');
			hash.update(auth.username + ':' + auth.realm + ':' + user.password, 'utf8');
			ha1 = hash.digest('hex');
		}

		if (auth.algorithm == 'MD5-sess') {
			const hash = crypto.createHash('md5');
			hash.update(ha1 + ':' + auth.nonce + ':' + auth.cnonce, 'utf8');
			ha1 = hash.digest('hex');
		}

		let hash = crypto.createHash('md5');
		hash.update(auth.method + ':' + auth.uri, 'utf8');
		const ha2 = hash.digest('hex');

		hash = crypto.createHash('md5');
		hash.update(ha1 + ':' + auth.nonce + ':' + auth.nc + ':' + auth.cnonce + ':' + auth.qop + ':' + ha2, 'utf8');
		const response = hash.digest('hex');

		if (auth.response == response) {
			const timestamp = (new Date()).getTime();

			if (session.expires > timestamp) {
				session.expires = timestamp;
				node.send(msg);
			} else {
				delete sessions[auth.nonce + auth.opaque];
				unAuth(node, msg, true);
			}
		} else {
			unAuth(node, msg);
		}
	} else {
		unAuth(node, msg);
	}
}

function digestSession(realm) {
	const date = new Date();
	const timestamp = date.getTime();
	const expires = timestamp + 10000; // 10 seconds from now
	const random = Math.random(timestamp);
	const nonce = new Buffer(timestamp + ':' + random).toString('base64');
	const opaque = new Buffer(String(timestamp + random)).toString('base64');
	const qop = 'auth';
	const algorithm = 'MD5-sess';

	return {
		timestamp,
		expires,
		random,
		realm,
		nonce,
		opaque,
		qop,
		algorithm,
	};
}

function unAuth(node, msg, stale) {
	const res = msg.res._res || msg.res; // Resolves deprecates warning messages.

	switch (node.httpauthconf.authType) {
		case 'Digest': {
			const session = digestSession(node.httpauthconf.realm);
			sessions[session.nonce + session.opaque] = session;

			res.set('WWW-Authenticate',
				'Digest realm="' + session.realm + '"' +
				', nonce="' + session.nonce + '"' +
				', opaque="' + session.opaque + '"' +
				', qop="' + session.qop + '"' +
				', algorithm="' + session.algorithm + '"' +
				(stale ? ', stale="true"' : ''),
			);
			break;
		}
		case 'Basic':
		default:
			res.set('WWW-Authenticate', 'Basic realm="' + node.httpauthconf.realm + '"');
			break;
	}

	res.type('text/plain');
	res.status(401).send('401 Unauthorized');
}

module.exports = function (RED) {
	'use strict';

	function HttpAuthNode(config) {
		RED.nodes.createNode(this, config);

		let src = 'inline';
		let authType = config.authType;
		let realm = config.realm.trim();
		let realmL = realm.toLowerCase();
		let username = config.username.trim();
		let usernameL = username.toLowerCase();
		let password = config.password;
		let hashed = config.hashed;
		let getUser = function (_realm, _username) {
			if (_realm.trim().toLowerCase() == realmL && _username.trim().toLowerCase() == usernameL) {
				return {
					realm,
					username,
					password,
					hashed,
				};
			}
			return null;
		};

		const cred = RED.nodes.getNode(config.cred);
		if (cred) {
			src = 'cred';
			authType = cred.authType;
			realm = cred.realm.trim();
			realmL = realm.toLowerCase();
			username = cred.username.trim();
			usernameL = username.toLowerCase();
			password = cred.password;
			hashed = cred.hashed;
		}

		const file = RED.nodes.getNode(config.file);
		if (file) {
			src = 'file';
			authType = file.authType;
			realm = file.realm.trim();
			realmL = realm.toLowerCase();
			getUser = file.getUser;
		}

		this.httpauthconf = {};
		this.httpauthconf.src = src;
		this.httpauthconf.authType = authType;
		this.httpauthconf.realm = realm;
		this.httpauthconf.getUser = getUser;

		const node = this;

		this.on('input', function (msg) {
			const header = msg.req.get('Authorization');
			const authType = header ? header.match(/^\w+\b/)[0] : null;

			if (header && authType == node.httpauthconf.authType) {
				const authStr = header.substring(authType.length).trim();

				switch (authType) {
					case 'Basic': basicAuth(authStr, node, msg); break;
					case 'Digest': digestAuth(authStr, node, msg); break;
					default: unAuth(node, msg);
				}
			} else {
				unAuth(node, msg);
			}
		});

		this.on('close', function () {
			// Called when the node is shutdown - eg on redeploy.
			// Allows ports to be closed, connections dropped etc.
			// eg: node.client.disconnect();
		});
	}

	RED.nodes.registerType('node-red-contrib-httpauth', HttpAuthNode);
};
