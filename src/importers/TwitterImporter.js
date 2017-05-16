'use strict';

const axios      = require('axios');
const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');
const oauth      = require('oauth');
const secrets    = require('../../secrets.json')


const requestUrl      = 'https://twitter.com/oauth/request_token';
const accessUrl       = 'https://twitter.com/oauth/access_token';
const callbackUrl     = 'http://127.0.0.1:8001/api/sessions/callback';
const signatureMethod = 'HMAC-SHA1';
const version         = '1.0A';

module.exports = class TwitterImporter {
    constructor(server) {
        this.server   = server;
        this.router   = server.router;
        this.db       = server.db.elastic;
        this.consumer = new oauth.OAuth(requestUrl, accessUrl,
            secrets.twitter.consumerKey, secrets.twitter.consumerSecret, version, callbackUrl, signatureMethod);
    }
    
    importTweets() {
        const query = 'ethereumproject';
        return this.getTweets(query).then(saveTweets.bind(this));
    }
    
    getTweets(query) {
        logger.debug(`get Tweets for query "${query}"`);
        const limit = 100;
        const until = '2017-05-10';
        const url   = `https://api.twitter.com/1.1/search/tweets.json?q=%40${query}&count=${limit}&until=${until}`;
        return new Promise((resolve, reject) => {
            this.consumer.get(url, this.accessToken, this.accessTokenSecret, (error, data) => {
                if (error) {
                    return reject(error);
                }
                return resolve(data);
            });
        });
    }
};

function saveTweets(data) {
    const promises = [];
    const tweets   = JSON.parse(data).statuses;
    
    let amountCreated = 0;
    
    tweets.forEach(status => {
        const tweet = {
            id            : status.id,
            created_at    : status.created_at,
            text          : status.text,
            retweet_count : status.retweet_count,
            favorite_count: status.favorite_count
        };
        
        const promise = this.db.index('tweets', 'ethereumproject', tweet)
            .then(status => {
                if (status.created)
                    amountCreated++;
            })
            .catch(error => {
                assert.equal(false, true);
            });
        promises.push(promise);
    });
    
    logger.debug(`received ${tweets.length} tweets. ${amountCreated} of them were new`);
    return Promise.all(promises);
}
