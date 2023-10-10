function basicAuth(authStr, node, msg) {
	const values = Buffer.from(authStr, 'base64').toString().split(':');
	const username = values[0];
	const password = values[1];
	const user = node.httpauthconf.getUser(node.httpauthconf.realm, username);

	if (user && password == user.password) {
		node.send(msg);
	} else {
		unAuth(node, msg);
	}
}

function unAuth(node, msg, stale) {
	const res = msg.res._res || msg.res; // Resolves deprecates warning messages.
	res.set('WWW-Authenticate', 'Basic realm="' + node.httpauthconf.realm + '"');
	res.type('text/plain');
	res.status(401).send('401 Unauthorized');
}

module.exports = function (RED) {
	'use strict';

	function HttpAuthNode(config) {
		RED.nodes.createNode(this, config);

		let src = 'inline';
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
			realm = file.realm.trim();
			realmL = realm.toLowerCase();
			getUser = file.getUser;
		}

		this.httpauthconf = {};
		this.httpauthconf.src = src;
		this.httpauthconf.realm = realm;
		this.httpauthconf.getUser = getUser;

		const node = this;

		this.on('input', function (msg) {
			const header = msg.req.get('Authorization');
			const authType = header ? header.match(/^\w+\b/)[0] : null;

			if (header && authType === 'Basic') {
				const authStr = header.substring(authType.length).trim();
				basicAuth(authStr, node, msg);
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

	RED.nodes.registerType('node-red-http-basic-auth', HttpAuthNode);
};
