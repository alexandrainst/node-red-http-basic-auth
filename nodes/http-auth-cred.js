module.exports = function (RED) {
	'use strict';

	function HttpAuthCredNode(config) {
		RED.nodes.createNode(this, config);

		this.realm = config.realm;
		this.username = config.username;
		this.password = config.password;
	}

	RED.nodes.registerType('http-basic-auth-cred', HttpAuthCredNode);
};
