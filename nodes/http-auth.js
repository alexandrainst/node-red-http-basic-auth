let bcrypt;
try {
	// Faster native library, if available
	bcrypt = require('bcrypt');
} catch (e) {
	// Pure JavaScript fallback
	bcrypt = require('bcryptjs');
}

function passwordCompare(plain, hash) {
	if (plain == '' || hash == '') {
		return false;
	}
	if (plain === hash) {
		return true;
	}

	// Compatibility work-around for 'bcrypt' library
	hash = hash.replace(/^\$2[x|y]\$/, '$2b$');

	return bcrypt.compareSync(plain, hash);
}

function basicAuth(authStr, node, msg) {
	const values = Buffer.from(authStr, 'base64').toString().split(':');
	const username = values[0];
	const password = values[1];
	const user = node.httpauthconf.getUser(username);

	if (user !== null && passwordCompare(password, user.password)) {
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
		const username = config.username.trim();
		const usernameL = username.toLowerCase();
		const password = config.password;
		let getUser = function (_username) {
			if (_username.trim().toLowerCase() === usernameL) {
				return {
					username,
					password,
				};
			}
			return null;
		};

		const multiple = RED.nodes.getNode(config.multiple);
		if (multiple) {
			src = 'multiple';
			getUser = multiple.getUser;
		}

		const file = RED.nodes.getNode(config.file);
		if (file) {
			src = 'file';
			getUser = file.getUser;
		}

		this.httpauthconf = {};
		this.httpauthconf.src = src;
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

	RED.nodes.registerType('http-basic-auth', HttpAuthNode);

	if (RED.httpAdmin) {
		const fs = require('fs');
		const path = require('path');
		RED.httpAdmin.get('/node-red-http-basic-auth/images/:file', function (req, res, next) {
			const filename = req.params.file.replace(/[^a-zA-Z0-9._-]/g, '').replace(/^\.+/g, '');
			const imagePath = path.join(__dirname, '..', 'images', filename);
			fs.readFile(imagePath, function (err, data) {
				if (err) {
					console.warn('Error reading image:', err);
					res.status(404).end();
				} else {
					res.set('Content-Type', 'image/png');
					res.send(data, function (err) {
						if (err) {
							console.warn('Error serving image:', err);
							res.status(500).end();
						}
					});
				}
			});
		});
	}
};
