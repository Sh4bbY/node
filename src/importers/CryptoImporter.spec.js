'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const chai      = require('chai');
const chaiHttp  = require('chai-http');
const Mockgoose = require('mockgoose').Mockgoose;

chai.use(chaiHttp);

const config         = require('../../config.json');
const Server         = require('../Server');
const Database       = require('../common/elasticsearch/Database');
const CryptoImporter = require('./CryptoImporter');

logger.setLevel('debug');


describe('CryptoImporter', () => {
    let server;
    let importer;
    let db;
    
    before(() => {
        server = new Server(config.server);
        db     = new Database(config.elasticsearch);
        server.registerDb('elasticSearch', db);
        importer = new CryptoImporter(server);
        server.start()
    });
    
    after(() => {
        return server.stop();
    });
    
    xdescribe('importData', () => {
        it('should ...', function (done) {
            this.timeout(5000);
            importer.importData()
                .then(() => done());
        });
    });
    
    
    xdescribe('count', () => {
        it('should ...', function (done) {
            this.timeout(10000);
            db.client.count({
                index: 'chart_data',
                type : 'BTC_ETH'
            }).then(result => {
                console.log(result.count);
                done();
            });
        });
    });
    
    xdescribe('delete', () => {
        it('should ...', function (done) {
            this.timeout(10000);
            db.client.search({
                index: 'chart_data',
                type : 'BTC_ETC'
            }).then(result => {
                console.log(result);
                done();
            });
        });
    });
    
    xdescribe('getAll', () => {
        const results = [];
        it('should ...', function (done) {
            this.timeout(10000);
            db.getAll('chart_data', 'BTC_ETH', (item) => ({x: item.date, y: item.close}))
                .then(results => {
                    console.log(results.length);
                    done();
                });
            
        });
    });
});
