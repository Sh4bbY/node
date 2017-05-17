'use strict';

const assert      = require('assert');
const logger      = require('log4js').getLogger('server');
const MysqlClient = require('../MysqlClient');
const Queries     = require('./Queries');

//logger.setLevel('off');

describe('Queries (Mysql)', () => {
    let client;
    let query;
    let userId;
    
    before((done) => {
        const config = {
            port    : 3306,
            host    : 'localhost',
            database: 'mydb',
            user    : 'root',
            password: ''
        };
        
        client = new MysqlClient(config);
        query  = new Queries(client);
        query.removeAllUsers().then(() => done());
    });
    
    
});
