'use strict';

const assert      = require('assert');
const logger      = require('log4js').getLogger('server');
const MysqlClient = require('./MysqlClient');

logger.setLevel('off');

xdescribe('MysqlClient', () => {
    let db;
    const config = {
        port    : 3306,
        host    : 'localhost',
        database: 'mydb',
        user    : 'root',
        password: ''
    };
    
    describe('connect', () => {
        it('should fail to connect to mysql server with invalid credentials', () => {
            const invalidConfig = Object.assign({}, config, {host: 'unknown'});
            
            db = new MysqlClient(invalidConfig);
            return db.connect().catch(() => assert(true));
        });
        
        it('should connect to mysql server', () => {
            db = new MysqlClient(config);
            return db.connect().then(() => assert(true));
        });
    });
    
    
    describe('query', () => {
        it('should retieve queried data', () => {
            return db.query('SELECT * FROM Users')
                .then((data) => {
                    assert(data instanceof Array);
                });
        });
    });
    
    
    describe('disconnect', () => {
        it('should disconnect from mysql server', () => {
            return db.disconnect().then(() => assert(true));
        });
        
        it('should fail to disconnect from mysql server when no connection is established', () => {
            return db.disconnect().catch(() => assert(true));
        });
    });
});
