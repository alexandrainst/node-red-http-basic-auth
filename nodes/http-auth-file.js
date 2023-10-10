const fs = require('fs');

module.exports = function (RED) {
	'use strict';

	function HttpAuthFileNode(config) {
		RED.nodes.createNode(this, config);

		const realm = config.realm.trim();
		const realmL = realm.toLowerCase();
		const filePath = config.filePath.trim();
		const hashed = config.hashed;
		const users = {};

		const stats = fs.statSync(filePath);
		if (stats.isFile()) {
			const data = fs.readFileSync(filePath, 'utf8');
			const lines = data.trim().split('\n');

			for (let index = 0; index < lines.length; index++) {
				const values = lines[index].split(':');
				const _username = values[0].trim();
				const _usernameL = _username.toLowerCase();
				const _realm = values[1].trim();
				const _realmL = _realm.toLowerCase();
				const _password = values[2];

				if (_realmL == realmL) {
					users[_usernameL] = {
						realm: _realm,
						username: _username,
						password: _password,
						hashed,
					};
				}
			}
		}

		this.realm = config.realm;
		this.getUser = function (_realm, _username) {
			const _realmL = _realm.trim().toLowerCase();
			const _usernameL = _username.trim().toLowerCase();
			if (_realmL == realmL && users[_usernameL]) {
				return {
					realm: users[_usernameL].realm,
					username: users[_usernameL].username,
					password: users[_usernameL].password,
					hashed: users[_usernameL].hashed,
				};
			}
			return null;
		};
	}

	RED.nodes.registerType('node-red-contrib-httpauthfile', HttpAuthFileNode);
};
