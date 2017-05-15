'use strict';

const axios      = require('axios');
const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');
const oauth      = require('oauth');


module.exports = class TwitterService {
    constructor(server) {
        this.server = server;
        this.router = server.router;
        this.db     = server.db;
        
        this.router.get('/api/tweets/:type', handleTweetSearch.bind(this));
        this.router.get('/api/twitter/get', handleGet.bind(this));
        this.router.get('/api/sessions/callback', handleSessionCallback.bind(this));
        this.router.get('/api/sessions/connect', handleSessionConnect.bind(this));
    }
};

function handleGet(req, res) {
    const url    = 'https://api.twitter.com/1.1/account/verify_credentials.json';
    const token  = req.session.oauthAccessToken;
    const secret = req.session.oauthAccessTokenSecret;
    return new Promise((resolve, reject) => {
        consumer.get(url, token, secret, (error, data) => {
            if (error) {
                res.redirect('/api/sessions/connect');
                reject(error);
            } else {
                const parsedData = JSON.parse(data);
                res.send('You are signed in: ' + parsedData.screen_name);
                resolve(error);
            }
        });
    });
}

const requestUrl      = 'https://twitter.com/oauth/request_token';
const accessUrl       = 'https://twitter.com/oauth/access_token';
const callbackUrl     = 'http://127.0.0.1:8001/api/sessions/callback';
const signatureMethod = 'HMAC-SHA1';
const version         = '1.0A';
const consumerKey     = 'hUy9MG3wUSPzdKw5P7Jovmecv';
const consumerSecret  = 'lhEaLl1NbMgEzQ8LiEAOAl3blS9FjEiqIyHURFC2ghr1yC7lqR';
const consumer        = new oauth.OAuth(requestUrl, accessUrl, consumerKey, consumerSecret,
    version, callbackUrl, signatureMethod);

function handleSessionConnect(req, res) {
    consumer.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
        if (error) {
            res.send('Error getting OAuth request token : ' + error, 500);
        } else {
            req.session.oauthRequestToken       = oauthToken;
            req.session.oauthRequestTokenSecret = oauthTokenSecret;
            console.log('Double check on 2nd step');
            console.log('------------------------');
            console.log('<<' + req.session.oauthRequestToken);
            console.log('<<' + req.session.oauthRequestTokenSecret);
            res.redirect('https://twitter.com/oauth/authorize?oauth_token=' + req.session.oauthRequestToken);
        }
    });
}

function handleSessionCallback(req, res) {
    console.log('------------------------');
    console.log('>>' + req.session.oauthRequestToken);
    console.log('>>' + req.session.oauthRequestTokenSecret);
    console.log('>>' + req.query.oauth_verifier);
    consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if (error) {
            res.send(`Error getting OAuth access token : ${error}[${oauthAccessToken}][${oauthAccessTokenSecret}][${results}]`, 500);
        } else {
            req.session.oauthAccessToken       = oauthAccessToken;
            req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
            
            res.redirect('/home');
        }
    });
}


function handleTweetSearch(req, res) {
    const index = 'tweets';
    const type  = req.params.type;
    const query = req.query.search;
    
    this.db.elasticSearch.search(index, type, query)
        .then(result => {
            const hits   = result.hits.hits;
            const output = hits.map(hit => ({id: hit._source.id, text: hit._source.text}));
            res.json(output)
        })
        .catch(err => logger.error(err));
}

