'use strict';

const assert      = require('assert');
const logger      = require('log4js').getLogger('server');
const MysqlClient = require('../MysqlClient');
const Queries     = require('./Queries');

//logger.setLevel('off');

describe('MysqlClient', () => {
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
    
    
    describe('createUser', () => {
        it('should create a user', () => {
            const user = {
                UserName    : 'JohnDoe99',
                FirstName   : 'John',
                EmailAddress: 'JohnDoe99@dead.com'
            };
            return query.createUser(user).then((result) => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 0);
                userId = result.insertId;
            });
        });
    });
    
    describe('getUserById', () => {
        it('should return a user', () => {
            return query.getUserById(userId).then((user) => {
                assert.equal(user.ID, userId);
            });
        });
    });
    
    describe('getUsers', () => {
        it('should get some users', () => {
            const options = {
                limit : 1,
                offset: 0,
                order : {
                    by       : 'UserName',
                    direction: 'ASC'
                }
            };
            return query.getUsers(options).then((results) => {
                assert(results instanceof Array);
            });
        });
    });
});
