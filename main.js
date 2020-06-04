"use strict";

/*
 * Created with @iobroker/create-adapter v1.25.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const Twit = require("twit");

var T;

// Load your modules here, e.g.:
// const fs = require("fs");

class TestProject extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "test_project",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:

		if(this.checkIfCredentials()){
			this.setCredentialsFromConfig();
			
		}

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/

		await this.setObjectAsync("username", {
			type: "state",
			common: {
				name: "username",
				type: "string",
				role: "text",
				read: true,
				write: true,
			},
			native: {},
		});

		await this.setObjectAsync("testVariable", {
			type: "state",
			common: {
				name: "testVariable",
				type: "boolean",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});

		await this.setObjectAsync("lastTweet", {
			type: "state",
			common: {
				name: "lastTweet",
				type: "string",
				role: "text",
				read: true,
				write: true,
			},
			native: {},
		});

		await this.setObjectAsync("lastFollower", {
			type: "state",
			common: {
				name: "lastTweet",
				type: "string",
				role: "text",
				read: true,
				write: true,
			},
			native: {},
		});

		await this.setObjectAsync("test", {
			type: "state",
			common: {
				name: "test",
				type: "string",
				role: "text",
				read: true,
				write: true,
			},
			native: {},
		});

		// in this template all states changes inside the adapters namespace are subscribed
		this.subscribeStates("*");

		/*
		setState examples
		you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		//await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		if(this.config.username){
			await this.setStateAsync("username", { val: this.config.username, ack: true });
		}

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//await this.setStateAsync("username", { val: this.config.username, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		/*let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);*/


		let d = this.getYourFollowersIDs();
		this.log.info("last Follower: " + this.getYourFollowersIDs());
		if(d){
			await this.setStateAsync("lastFollower", { val: d, ack: true });
		} else {
			this.log.warn("d is undefined, getYourFollwersIDs mit d")
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.log.info("cleaned everything up...");
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	//Set Twitter Credentials from the entered config
	setCredentialsFromConfig(){ 
		T = new Twit({
			consumer_key: this.config.consumerKey,
			consumer_secret: this.config.consumerSecret,
			access_token: this.config.accessToken,
			access_token_secret: this.config.accessTokenSecret
		});
	}

	checkIfCredentials(){
		if(this.config.consumerKey && this.config.consumerSecret && this.config.accessToken && this.config.accessTokenSecret){
			this.log.info("checkIfCredentials(), all credentials are entered");
			return true;
		} else {
			this.log.info("checkIfCredentials(), credentials are incomplete");
			return false;
		}
	}

	postHelloWorldTweet() {
		if(this.checkIfCredentials()){
			let d = "twitter-Test, before Hello World Request";
			T.post('statuses/update', { status: 'hello world!' }, function (err, data, response) {
				console.log("postHelloWorldTweet(), data: " + data);
				d = data;
			});
			this.log.info("postHelloWorldTweet(): " + d);  
		}
	}



	
	setCredentials(consumer_key, consumer_secret, access_token, access_token_secret) {
		T = new Twit({
			consumer_key: consumer_key,
		  	consumer_secret: consumer_secret,
		  	access_token: access_token,
		  	access_token_secret: access_token_secret,
		});
	}
	
	getYourFollowersIDs() {
		if(this.checkIfCredentials()){
			T.get('followers/ids', { screen_name: this.config.username }, function (err, data, response) {
				return "data "+ data +" response " + response;
			});
		} else{
			return null;
		}
	}
	
	getYourLastFollower() {
		T.get('followers/list', { screen_name: this.config.username }, function (err, data, response) {
		 	console.log(data.users[0].id);
		  	console.log(data.users[0].name);
		  	console.log(data.users[0].screen_name);
		});
	}  
	
	/*
	//	funktioniert noch nicht..

	getUser(id) {
		T.get('users/:id', { id: id }, function (err, data, response) {
		  	console.log(data)
		});
	}*/

	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new TestProject(options);
} else {
	// otherwise start the instance directly
	new TestProject();
}