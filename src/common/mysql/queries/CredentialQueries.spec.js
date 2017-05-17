'use strict';

const assert            = require('assert');
const logger            = require('log4js').getLogger('server');
const MysqlClient       = require('../MysqlClient');
const CredentialQueries = require('./CredentialQueries');
const UserQueries       = require('./UserQueries');

//logger.setLevel('off');

describe('CredentialQueries (Mysql)', () => {
    let client;
    let query;
    let userQuery;
    let userId;
    
    before(() => {
        const config = {
            port    : 3306,
            host    : 'localhost',
            database: 'mydb',
            user    : 'root',
            password: ''
        };
        
        client    = new MysqlClient(config);
        query     = new CredentialQueries(client);
        userQuery = new UserQueries(client);
        return userQuery.removeAllUsers();
    });
    
    describe('createCredentials', () => {
        it('should create Credentials for a user', () => {
            const user = {
                UserName    : 'CredentialJohnny',
                FirstName   : 'John',
                LastName    : 'Doe',
                EmailAddress: 'JohnDoe@localhost.com'
            };
            return userQuery.createUser(user).then(result => {
                const credentials = {
                    Password     : 'mySecretPassword',
                    UserName     : user.UserName,
                    RelatedUserID: result.insertId
                };
                return query.createCredentials(credentials).then((result) => {
                    assert.equal(result.affectedRows, 1);
                    assert.equal(result.warningCount, 0);
                    assert.equal(result.changedRows, 0);
                });
            });
        });
    });
    
    describe('checkCredentials', () => {
        it('should resolve userId if credentials are valid', () => {
            const username = 'CredentialJohnny';
            const password = 'mySecretPassword';
            
            return query.checkCredentials(username, password).then(userId => {
                assert((typeof userId === 'number') && userId > 0);
            });
        });
        
        it('should reject "invalid credentials" if password is invalid', () => {
            const username = 'CredentialJohnny';
            const password = 'fakepass';
            
            return query.checkCredentials(username, password).catch(error => {
                assert.equal(error, 'invalid credentials');
            });
        });
        
        it('should reject "unknown user" if username cannot be found', () => {
            const username = 'unknownUser';
            const password = 'somePass';
            
            return query.checkCredentials(username, password).catch(error => {
                assert.equal(error, 'unknown user');
            });
        });
        
        it('should reject a ValidatorError method is called with invalid parameters', () => {
            return query.checkCredentials().catch(error => {
                assert(error instanceof Error);
                assert.equal(error.name, 'ValidationError');
            });
        });
    });
});
