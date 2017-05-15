'use strict';

const assert   = require('assert');
const logger   = require('log4js').getLogger('server');
const mongoose = require('mongoose');
const chai     = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const config          = require('../../config.json');
const Server          = require('../Server');
const Database        = require('../common/elasticsearch/Database');
const TwitterImporter = require('./TwitterImporter');

logger.setLevel('debug');

describe('TwitterService', () => {
    let server;
    let importer;
    let esClient;
    
    before(() => {
        server   = new Server(config.server);
        esClient = new Database(Object.assign({}, config.elasticsearch, {log: 'error'}));
        server.registerDb('elasticSearch', esClient);
        importer = new TwitterImporter(server);
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
            esClient.search('tweets', 'ethereumproject').then(result => {
                console.log('RESULT: ', result);
                done();
            });
        });
    });
});
