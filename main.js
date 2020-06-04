"use strict";

/*
 * Created with @iobroker/create-adapter v1.25.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const Twit = require("twit");
const Follower = require("./classes/Follower");
const UserInformation = require("./classes/UserInformation");

const TAG = "ioBroker Twitter - "

var T;

class TwitterProject extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "twitter",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		this.on("message", this.onMessage.bind(this));
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
			this.twitAuth((u)=>{
				this.userId = u.id;
				this.username = u.screen_name;
				this.userDescription = u.description;
				this.followers_count = u.followers_count;
				this.profile_image_url = u.profile_image_url;
				this.created_at = u.created_at;
			});
			this.getYourLastFollower((follower)=>{
				this.lastFollower = follower.screen_name;
			});
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

		await this.setObjectAsync("own_id", {
			type: "state",
			common: {
				name: "own_id",
				type: "string",
				role: "text",
				read: true,
				write: true,
			},
			native: {},
		});

		await this.setObjectAsync("own_description", {
			type: "state",
			common: {
				name: "own_description",
				type: "string",
				role: "text",
				read: true,
				write: true,
			},
			native: {},
		});

		await this.setObjectAsync("followers_count", {
			type: "state",
			common: {
				name: "followers_count",
				type: "string",
				role: "text",
				read: true,
				write: true,
			},
			native: {},
		});

		await this.setObjectAsync("profile_image_url", {
			type: "state",
			common: {
				name: "profile_image_url",
				type: "string",
				role: "text",
				read: true,
				write: true,
			},
			native: {},
		});

		await this.setObjectAsync("created_at", {
			type: "state",
			common: {
				name: "created_at",
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
		} else if(this.username){
			await this.setStateAsync("username", { val: this.username, ack: true });
			this.config.username = this.username;
		}
		if(this.lastFollower){
			await this.setStateAsync("lastFollower", { val: this.lastFollower, ack: true });
		}
		if(this.userId){
			await this.setStateAsync("own_id", { val: this.userId, ack: true });
		}
		if(this.userDescription){
			await this.setStateAsync("own_description", { val: this.userDescription, ack: true });
		}
		if(this.followers_count){
			await this.setStateAsync("followers_count", { val: this.followers_count, ack: true });
		}
		if(this.profile_image_url){
			await this.setStateAsync("profile_image_url", { val: this.profile_image_url, ack: true });
		}
		if(this.created_at){
			await this.setStateAsync("created_at", { val: this.created_at, ack: true });
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

	/**
	 * Set Twitter Credentials from the entered config in the adapter page
	 */	 
	setCredentialsFromConfig(){ 
		T = new Twit({
			consumer_key: this.config.consumerKey,
			consumer_secret: this.config.consumerSecret,
			access_token: this.config.accessToken,
			access_token_secret: this.config.accessTokenSecret
		});
	}

	/**
	 * checks, if all credentials are entered in the adapter page
	 * 
	 */
	checkIfCredentials(){
		if(this.config.consumerKey && this.config.consumerSecret && this.config.accessToken && this.config.accessTokenSecret){
			this.log.info(TAG + "checkIfCredentials(), all credentials are entered");
			return true;
		} else {
			this.log.info(TAG + "checkIfCredentials(), credentials are incomplete");
			return false;
		}
	}

	/**
	 *
	 * post a dummy hello world tweet to proof, that everything works fine
	 * 
	 * @param {*} callback 
	 */
	postHelloWorldTweet(callback) {
		let s = Math.floor(Math.random() * 100) + 1;
		let tweetText = 'Hello world! This is my iobroker test tweet. Random number: '+s;
		this.postTweet(tweetText, (postedText)=>{
			callback(postedText);
		});
	}

	/**
	 * 
	 * Post a tweet with your own text
	 * 
	 * @param {*} tweetText 
	 * @param {*} callback 
	 */
	postTweet(tweetText, callback) {
		if(this.checkIfCredentials()){
			T.post('statuses/update', { status: tweetText }, function (err, data, response) {
				if(err){
					callback(err);
				} else {
					callback(data.text);
				}
			});
		}
	}
	
	/**
	 * 
	 * @param {*} consumer_key 
	 * @param {*} consumer_secret 
	 * @param {*} access_token 
	 * @param {*} access_token_secret 
	 */
	setCredentials(consumer_key, consumer_secret, access_token, access_token_secret) {
		T = new Twit({
			consumer_key: consumer_key,
		  	consumer_secret: consumer_secret,
		  	access_token: access_token,
		  	access_token_secret: access_token_secret,
		});
	}
	
	/**
	 * needs more implementation
	 * 
	 * Get a list of the IDs of your followers on twitter
	 * 
	 * @param {*} callback 
	 */
	getListOfYourFollowers(callback) {
		if(this.checkIfCredentials() && this.config.username ){
			T.get('followers/list', { screen_name: this.config.username }, function (err, data, response) {
				if(err){
					callback(err);
				} else {
					let u = [];
					data.users.forEach(e => {
						let f = new Follower(e.id, e.screen_name, e.followers_count);
						u.push(f);
					});
					callback(u);
				}
			});
		}
	} 
	
	/**
	 * needs more implementation
	 * 
	 * get the ID of your last follower on twitter 
	 * 
	 * @param {*} callback 
	 */
	getYourLastFollower(callback) {
		if(this.checkIfCredentials() && this.config.username ){
			T.get('followers/list', { screen_name: this.config.username }, function (err, data, response) {
				if(err){
					callback(err);
				} else {
					let u = data.users[0];
					callback(new Follower(u.id, u.screen_name, u.followers_count));
				}
			});
		}
	} 
	
	/**
	 * 
	 * Authorize at twitter and get some profile information 
	 * 
	 * @param {*} callback 
	 */
	twitAuth(callback){
		if(this.checkIfCredentials()){
			T.get('account/verify_credentials', { skip_status: true }, function (err, data, response) {
				if(err){
					callback(err);
				} else {
					let u = data;
					callback(new UserInformation(u.id, u.screen_name, u.description, u.followers_count, u.profile_image_url, u.created_at));
				}
			});
		}
	}


	/**
	* Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	* Using this method requires "common.message" property to be set to true in io-package.json
	* @param {ioBroker.Message} obj
	*/
	onMessage(obj) {
		if (typeof obj === "object"){
			if(obj.message) {
				if (obj.command === "send") {
					// e.g. send email or pushover or whatever
					this.postTweet(obj.message, (text)=>{
						this.log.info(TAG + "posted, message: " + text);
					});

					// Send response in callback if required
					//if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
				} else if (obj.command === "post") {
					this.postTweet(obj.message, (text)=>{
						this.log.info(TAG + "posted, message: " + text);
					});
				} else if (obj.command === "auth") {
					
				}
			}
			if (obj.command === "dummyPost") {
				this.postHelloWorldTweet((text)=>{
					this.log.info(TAG + "dummy posted: " + text);
				});
			} 
		}
	 }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new TwitterProject(options);
} else {
	// otherwise start the instance directly
	new TwitterProject();
}