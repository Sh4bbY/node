'use strict';

const assert   = require('assert');
const logger   = require('log4js').getLogger('server');
const Database = require('./Database');

logger.setLevel('off');

describe('ElasticSearch', () => {
    let db;
    before(() => {
        const config = {
            port: 9200,
            host: 'localhost',
            log : 'error'
        };
        
        db = new Database(config);
    });
    
    describe('ping', () => {
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
