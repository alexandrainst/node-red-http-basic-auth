module.exports = function (RED) {
	'use strict';

	function HttpAuthMultipleNode(config) {
		RED.nodes.createNode(this, config);

		const realm = config.realm.trim();
		const realmL = realm.toLowerCase();
		const users = {};
		for (const key in config.auths) {
			config.auths[key].forEach(function (value, index) {
				const _username = value.user.trim();
				const _usernameL = _username.toLowerCase();
				const _realm = key;
				const _realmL = _realm.toLowerCase();
				const _password = value.password;

				if (_realmL === realmL) {
					users[_usernameL] = {
						realm: _realm,
						username: _username,
						password: _password,
					};
				}
			});
		}

		this.realm = config.realm;
		this.getUser = function (_realm, _username) {
			const _realmL = _realm.trim().toLowerCase();
			const _usernameL = _username.trim().toLowerCase();
			if (_realmL === realmL && users[_usernameL]) {
				return {
					realm: users[_usernameL].realm,
					username: users[_usernameL].username,
					password: users[_usernameL].password,
				};
			}
			return null;
		};
	}

	RED.nodes.registerType('http-basic-auth-multiple', HttpAuthMultipleNode);
};
