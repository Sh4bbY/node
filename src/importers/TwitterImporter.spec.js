'use strict';

const assert = require('assert');
const logger = require('log4js').getLogger('server');

const Server          = require('../Server');
const ElasticClient   = require('../common/elastic/ElasticClient');
const TwitterImporter = require('./TwitterImporter');

const config = {
    express      : {
        protocol : 'http',
        port     : 8888,
        jwtSecret: 'test-secret-1234567890'
    },
    elasticsearch: {
        port: 9200,
        host: 'localhost',
        log : 'error'
    },
    twitter      : {
        consumerKey   : 'asdasdasdasdasdsad',
        consumerSecret: 'asdasdasdasdasdsad'
    }
};

logger.setLevel('debug');

describe('TwitterService', () => {
    let server;
    let importer;
    let db;
    
    before(() => {
        server   = new Server(config.express);
        db       = new ElasticClient(config.elasticsearch);
        importer = new TwitterImporter(server, config.twitter);
        server.registerDb('elastic', db);
        server.registerService(importer);
        server.start();
    });
    
    after(() => {
        return server.stop();
    });
    
    xdescribe('import TwitterData', () => {
        it('should ...', function (done) {
            this.timeout(20000);
            importer.importTweets().then(result => {
                done();
            });
        });
    });
    
    
    xdescribe('retrieve TwitterData', () => {
        it('should ...', function (done) {
            this.timeout(20000);
            db.search('tweets', 'ethereumproject').then(result => {
                console.log('RESULT: ', result);
                done();
            });
        });
    });
});
