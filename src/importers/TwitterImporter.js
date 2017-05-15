'use strict';

const axios      = require('axios');
const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');
const oauth      = require('oauth');


const requestUrl      = 'https://twitter.com/oauth/request_token';
const accessUrl       = 'https://twitter.com/oauth/access_token';
const callbackUrl     = 'http://127.0.0.1:8001/api/sessions/callback';
const signatureMethod = 'HMAC-SHA1';
const version         = '1.0A';

module.exports = class TwitterImporter {
    constructor(server) {
        this.server         = server;
        this.router         = server.router;
        this.db             = server.db.elasticSearch;
        this.consumerKey    = 'hUy9MG3wUSPzdKw5P7Jovmecv';
        this.consumerSecret = 'lhEaLl1NbMgEzQ8LiEAOAl3blS9FjEiqIyHURFC2ghr1yC7lqR';
        this.consumer       = new oauth.OAuth(requestUrl, accessUrl, this.consumerKey, this.consumerSecret,
            version, callbackUrl, signatureMethod);
        
        //this.router.get('/api/sessions/callback', handleSessionCallback.bind(this));
    }
    
    getRequestToken() {
        if (!!this.requestToken) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            this.consumer.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
                if (error) {
                    logger.error('Error getting OAuth request token : ' + error, 500);
                    return reject(error);
                }
                this.requestToken       = oauthToken;
                this.requestTokenSecret = oauthTokenSecret;
                axios.get('https://twitter.com/oauth/authorize?oauth_token=' + this.requestToken)
                    .then(() => {
                        console.log('AXIOS OKAY');
                        setTimeout(() => resolve(), 1000);
                    })
                    .catch(err => reject(err));
            });
        });
    }
    
    getAccessToken(oauth_verifier) {
        return new Promise((resolve, reject) => {
            this.consumer.getOAuthAccessToken(this.requestToken, this.requestTokenSecret, oauth_verifier,
                (error, oauthAccessToken, oauthAccessTokenSecret) => {
                    if (error) {
                        logger.error(`Error getting OAuth access token : ${error}`, 500);
                        return reject(error);
                    }
                    
                    this.accessToken       = oauthAccessToken;
                    this.accessTokenSecret = oauthAccessTokenSecret;
                    console.log('received access token');
                    
                    return resolve();
                });
        });
    }
    
    importTweets() {
        const query = 'ethereumproject';
        return this.getTweets(query)
            .then(saveTweets.bind(this));
    }
    
    getTweets(query) {
        logger.debug(`get Tweets for query "${query}"`);
        const limit = 100;
        const until = '2017-05-10';
        const url = `https://api.twitter.com/1.1/search/tweets.json?q=%40${query}&count=${limit}&until=${until}`;
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
    
    let amountCreated=0;
    
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
                if(status.created)
                    amountCreated++;
            })
            .catch(error => {
                assert.equal(false,true);
            });
        promises.push(promise);
    });
    
    logger.debug(`received ${tweets.length} tweets. ${amountCreated} of them were new`);
    return Promise.all(promises);
}

function handleSessionCallback(req, res) {
    this.getAccessToken(req.query.oauth_verifier)
        .then(() => {
            logger.info('RequestToken verified');
            res.sendStatus(200);
        });
}
