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
    
    const user = {
        UserName    : 'UserJohnny',
        FirstName   : 'John',
        LastName    : 'Doe',
        EmailAddress: 'UserJohnny@test.com'
    };
    const password = 'mySecretPassword';
    
    before(() => {
        const config = {
            port    : 3306,
            host    : 'localhost',
            database: 'mydb',
            user    : 'root',
            password: 'root-secret-pw'
        };
        
        client = new MysqlClient(config);
        query  = new UserQueries(client);
    });
    
    describe('createUser', () => {
        it('should create a user', () => {
            return query.createUser(user, password).then((result) => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 0);
                assert((typeof result.insertId) === 'number' && result.insertId > 0);
                userId = result.insertId;
            });
        });
    });
    
    describe('loginUser', () => {
        it('should resolve userId if credentials are valid', () => {
            return query.loginUser(user.UserName, password).then(userId => {
                assert((typeof userId === 'number') && userId > 0);
            });
        });
        
        it('should reject "invalid credentials" if password is invalid', () => {
            const password = 'fakepass';
            
            return query.loginUser(user.UserName, password).catch(error => {
                assert.equal(error, 'invalid credentials');
            });
        });
        
        it('should reject "unknown user" if username cannot be found', () => {
            const username = 'unknownUser';
            const password = 'somePass';
            
            return query.loginUser(username, password).catch(error => {
                assert.equal(error, 'unknown user');
            });
        });
        
        it('should reject a ValidatorError method is called with invalid parameters', () => {
            return query.loginUser().catch(error => {
                assert(error instanceof Error);
                assert.equal(error.name, 'ValidationError');
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
    
    describe('removeUser', () => {
        it('should remove a user', () => {
            return query.removeUser(userId).then((result) => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 1);
            });
        });
    });
});
