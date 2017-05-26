'use strict';

const assert      = require('assert');
const logger      = require('log4js').getLogger('server');
const MysqlClient = require('../MysqlClient');
const UserQueries = require('./UserQueries');
const BlogQueries = require('./BlogQueries');

//logger.setLevel('off');

describe('BlogQueries (Mysql)', () => {
    let client;
    let blogQuery, userQuery;
    let userId, postId;
    
    before(() => {
        const config = {
            port    : 3306,
            host    : 'localhost',
            database: 'mydb',
            user    : 'root',
            password: 'root-secret-pw'
        };
        const user   = {
            UserName    : 'BlogJohnny',
            FirstName   : 'John',
            LastName    : 'Doe',
            EmailAddress: 'BlogJohnny@test.com'
        };
        const password = 'mySecretPassword';
        
        client    = new MysqlClient(config);
        blogQuery = new BlogQueries(client);
        userQuery = new UserQueries(client);
        return client.query('DELETE FROM `Posts`')
            .then(() => userQuery.createUser(user, password))
            .then(result => userId = result.insertId);
    });
    
    after(() => {
        return userQuery.removeUser(userId)
    });
    
    describe('createPost', () => {
        it('should create a blog post', () => {
            const post = {
                Title        : 'Unit test for creating a blog post is working',
                Content      : 'Lorem ipsum dolor sit amed.',
                RelatedUserID: userId
            };
            return blogQuery.createPost(post).then(result => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 0);
                assert((typeof result.insertId) === 'number' && result.insertId > 0);
                postId = result.insertId;
            });
        });
    });
    
    describe('updatePost', () => {
        it('should update a blog post', () => {
            const post = {
                Title  : 'Unit test for updating a blog post is working',
                Content: 'Lorem ipsum dolor sit amed!!!!'
            };
            return blogQuery.updatePost(postId, post).then(result => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 1);
            });
        });
        
        it('should publish a blog post', () => {
            const post = {
                Status: 'PUBLISHED'
            };
            return blogQuery.updatePost(postId, post).then(result => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 1);
            });
        });
    });
});
