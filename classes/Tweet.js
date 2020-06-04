'use strict';

const http = require('http');

class Tweet {

    constructor() {
        this.text = "";
        this.user = "";
    }

    postHelloWorldTweet(callback) {
        const options = {
            hostname: `https://api.twitter.com`,
            path: `/1.1/statuses/update.json?status=Hello%20world`,
            method: 'POST',
            headers: `OAuth oauth_consumer_key="4kXAAHiNP4CE31UAmqyaNxHIp",
            oauth_token="1154373550289104898-LRrg95vfjsVZhwmjI0T1SKE66v02WY",
            oauth_signature_method="HMAC-SHA1",
            oauth_version="1.0"`
        }
        let tweet = this;
        Tweet.prototype.requestToPostTweet(options, tweet, function (responsePostTweet) {
            callback(responsePostTweet);
        });
    }

    requestToPostTweet(options, tweet, callback) {
        const req = http.request(options, (res) => {
            var body = "";
            res.on('data', (resData) => {
                body += resData;
            });
            res.on('end', function () {
                try {
                    var json = JSON.parse(body);
                    tweet.text = json.text;
                    tweet.user = json.user.screen_name;
                    callback(tweet);
                } catch (error) {
                    console.log(error);
                    callback(null);
                }
            });
        });
        req.end();
    }
}

module.exports = Tweet;