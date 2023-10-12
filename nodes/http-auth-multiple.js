module.exports = function (RED) {
	'use strict';

	function HttpAuthMultipleNode(config) {
		RED.nodes.createNode(this, config);

		const users = {};
		config.auths.forEach(function (value, index) {
			const _username = value.user.trim();
			const _usernameL = _username.toLowerCase();
			const _password = value.password;

			users[_usernameL] = {
				username: _username,
				password: _password,
			};
		});

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

	RED.nodes.registerType('http-basic-auth-multiple', HttpAuthMultipleNode);
};
