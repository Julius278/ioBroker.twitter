"use strict";

/*
 * Created with @iobroker/create-adapter v1.25.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const Twit = require("twit");
const Tweet = require("./classes/Tweet");

const TAG = "ioBroker Twitter - "

var T;
var tweet;
var adapter;

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

		adapter = utils.Adapter(this);
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
				name: "lastFollower",
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


		/*
		let d = this.getYourFollowersIDs();
		this.log.info("last Follower: " + this.getYourFollowersIDs());
		if(d){
			await this.setStateAsync("lastFollower", { val: d, ack: true });
		} else {
			this.log.warn("d is undefined, getYourFollwersIDs mit d")
		}*/

		/*this.postHelloWorldTweet((d)=>{
			this.log.info("twitter - posted: "+ d);
			this.setStateAsync("lastTweet", { val: d, ack: true });
		});*/
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
			this.log.info(TAG + `object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(TAG + `object ${id} deleted`);
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
			this.log.info(TAG + `state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(TAG + `state ${id} deleted`);
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
			this.log.info(TAG + "checkIfCredentials(), all credentials are entered");
			return true;
		} else {
			this.log.info(TAG + "checkIfCredentials(), credentials are incomplete");
			return false;
		}
	}

	postHelloWorldTweet(callback) {
		if(this.checkIfCredentials()){
			T.post('statuses/update', { status: 'hello world!' }, function (err, data, response) {
				callback(data.text);
			});
		}
	}

	requestTweet(){
		tweet = new Tweet();
		tweet.postHelloWorldTweet( (responsePostTweet) => {
			this.log.debug(TAG + "responsePostTweet: " + responsePostTweet);
		});
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
			return
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
	
	twitAuth(){
		return T.get('account/verify_credentials', { skip_status: true })
			.catch(function (err) {
				console.log('caught error', err.stack)
			})
			.then(function (result) {
				// `result` is an Object with keys "data" and "resp".
				// `data` and `resp` are the same objects as the ones passed
				// to the callback.
				// See https://github.com/ttezel/twit#tgetpath-params-callback
				// for details.
				console.log(TAG + 'data', result.data.screen_name);
				return result.data;
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
function sendNotification(adapter, message, callback) {

	adapter.log.debug("Test, sendTo hat funktioniert");

	if(message){
		console.log("message");
		adapter.log.debug("Test, message if callback");
		callback();
	}
}

/*
function sendNotification(adapter, message, callback) {
    message = message || {};

    if (!pushover) {
        if (adapter.config.user && adapter.config.token) {
            pushover = new Pushover({
                user:  adapter.config.user,
                token: adapter.config.token,
                onerror: onError
            });
        } else {
            adapter.log.error('Cannot send notification while not configured');
        }
    }

    if (!pushover) {
        return;
    }

    if (typeof message !== 'object') {
        message = {message};
    }
    if (message.hasOwnProperty('token')) {
        pushover.token = message.token;
    } else {
        pushover.token = adapter.config.token;
    }
    message.title     = message.title     || adapter.config.title;
    message.sound     = message.sound     || (adapter.config.sound ? adapter.config.sound : undefined);
    message.priority  = message.priority  || adapter.config.priority;
    message.url       = message.url       || adapter.config.url;
    message.url_title = message.url_title || adapter.config.url_title;
    message.device    = message.device    || adapter.config.device;
    message.message   = message.message   || '';

    // if timestamp in ms => make seconds // if greater than 2000.01.01 00:00:00
    if (message.timestamp && message.timestamp > 946681200000) {
        message.timestamp = Math.round(message.timestamp / 1000);
    }

    // mandatory parameters if priority is high (2)
    if (message.priority === 2) {
        message.retry  = parseInt(message.retry, 10)  || 60;
        message.expire = parseInt(message.expire, 10) || 3600;
    }

    adapter.log.info('Send pushover notification: ' + JSON.stringify(message));

    pushover.send(message, (err, result) => {
        if (err) {
            adapter.log.error('Cannot send notification: ' + JSON.stringify(err));
            if (callback) callback(err);
            return false;
        } else {
            if (callback) callback(null, result);
            return true;
        }
	});
}*/

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