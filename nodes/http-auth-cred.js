module.exports = function (RED) {
	'use strict';

	function HttpAuthCredNode(config) {
		RED.nodes.createNode(this, config);

		this.realm = config.realm;
		this.username = config.username;
		this.password = config.password;
	}

	RED.nodes.registerType('node-red-http-basic-auth-cred', HttpAuthCredNode);
};
