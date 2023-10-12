const fs = require('fs');

module.exports = function (RED) {
	'use strict';

	function HttpAuthFileNode(config) {
		RED.nodes.createNode(this, config);

		const filePath = config.filePath.trim();
		const users = {};

		const stats = fs.statSync(filePath);
		if (stats.isFile()) {
			const data = fs.readFileSync(filePath, 'utf8');
			const lines = data.trim().split('\n');

			for (let index = 0; index < lines.length; index++) {
				const values = lines[index].split(':');
				const _username = values[0].trim();
				const _usernameL = _username.toLowerCase();
				const _password = values[1];

				users[_usernameL] = {
					username: _username,
					password: _password,
				};
			}
		}

		this.getUser = function (_username) {
			const _usernameL = _username.trim().toLowerCase();
			if (users[_usernameL]) {
				return {
					username: users[_usernameL].username,
					password: users[_usernameL].password,
				};
			}
			return null;
		};
	}

	RED.nodes.registerType('http-basic-auth-file', HttpAuthFileNode);
};
