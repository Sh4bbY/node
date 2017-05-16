'use strict';

const assert = require('assert');
const logger = require('log4js').getLogger('server');

const Server         = require('../Server');
const ElasticClient  = require('../common/elastic/ElasticClient');
const CryptoImporter = require('./CryptoImporter');

const config = {
    express      : {
        protocol: 'http',
        port    : 8888,
        secret  : 'test-secret-1234567890'
    },
    elasticsearch: {
        port: 9200,
        protocol: 'http',
        log : 'error'
    }
};

//logger.setLevel('debug');

describe('CryptoImporter', () => {
    let server;
    let importer;
    let db;
    
    before(() => {
        server   = new Server(config.express);
        db       = new ElasticClient(config.elasticsearch);
        importer = new CryptoImporter(server);
        server.registerDb('elastic', db);
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
            db.count({
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
