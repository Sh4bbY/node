'use strict';

const assert      = require('assert');
const logger      = require('log4js').getLogger('server');
const MysqlClient = require('../MysqlClient');
const UserQueries = require('./UserQueries');

//logger.setLevel('off');

describe('UserQueries (Mysql)', () => {
    let client;
    let query;
    let userId;
    
    before(() => {
        const config = {
            port    : 3306,
            host    : 'localhost',
            database: 'mydb',
            user    : 'root',
            password: ''
        };
        
        client = new MysqlClient(config);
        query  = new UserQueries(client);
        return query.removeAllUsers();
    });
    
    describe('createUser', () => {
        it('should create a user', () => {
            const user = {
                UserName    : 'JohnDoe',
                FirstName   : 'John',
                LastName    : 'Doe',
                EmailAddress: 'JohnDoe@localhost.com'
            };
            return query.createUser(user).then((result) => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 0);
                assert((typeof result.insertId) === 'number' && result.insertId > 0);
                userId = result.insertId;
            });
        });
    });
    
    describe('updateUser', () => {
        it('should update user information', () => {
            const user = {
                UserName    : 'JohnDoeNew',
                FirstName   : 'JohnNew',
                LastName    : 'DoeNew',
                EmailAddress: 'JohnDoe@newlocalhost.com'
            };
            return query.updateUser(userId, user).then((result) => {
                console.log(result);
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 1);
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
    
    describe('registerUser', () => {
        it('should create a user with credentials for that user', () => {
            const password = 'mySecretPassword';
            const user     = {
                UserName    : 'Johnny2',
                EmailAddress: 'johnny2@localhost.com'
            };
            return query.registerUser(user, password).then((result) => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 0);
                assert((typeof result.insertId) === 'number' && result.insertId > 0);
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
