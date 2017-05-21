'use strict';

const assert   = require('assert');
const logger   = require('log4js').getLogger('server');
const ElasticClient = require('./ElasticClient');

logger.setLevel('off');

describe('ElasticClient', () => {
    let db;
    before(() => {
        const config = {
            port: 9200,
            host: 'localhost',
            log : 'error'
        };
        
        db = new ElasticClient(config);
    });
    
    xdescribe('ping', () => {
        it('should ping elasticSearch', (done) => {
            db.ping().then(res => done());
        });
    });
    
    xdescribe('search', () => {
        it('should search elasticSearch', (done) => {
            db.search('something').then(res => {
                console.log(res);
                done()
            });
        });
    });
});
