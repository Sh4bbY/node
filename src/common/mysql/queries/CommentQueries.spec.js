'use strict';

const assert         = require('assert');
const logger         = require('log4js').getLogger('server');
const MysqlClient    = require('../MysqlClient');
const UserQueries    = require('./UserQueries');
const BlogQueries    = require('./BlogQueries');
const CommentQueries = require('./CommentQueries');

//logger.setLevel('off');

describe('CommentQueries (Mysql)', () => {
    let client;
    let blogQuery, userQuery, commentQuery;
    let userId, postId, commentId;
    
    before(() => {
        const config = {
            port    : 3306,
            host    : 'localhost',
            database: 'mydb',
            user    : 'root',
            password: 'root-secret-pw'
        };
        const user   = {
            UserName    : 'CommentJohnny',
            FirstName   : 'John',
            LastName    : 'Doe',
            EmailAddress: 'CommentJohnny@test.com'
        };
        const password = 'mySecretPassword';
        
        client       = new MysqlClient(config);
        blogQuery    = new BlogQueries(client);
        userQuery    = new UserQueries(client);
        commentQuery = new CommentQueries(client);
        return client.query('DELETE FROM `Posts`')
            .then(() => userQuery.createUser(user, password))
            .then(result => userId = result.insertId);
    });
    
    after(() => {
        return userQuery.removeUser(userId);
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
    
    describe('createComment', () => {
        it('should create a comment to a blog post', () => {
            const comment = {
                Content      : 'Unit test for creating a comment is working.',
                RelatedUserID: userId,
                RelatedPostID: postId
            };
            return commentQuery.createComment(comment).then(result => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 0);
                assert((typeof result.insertId) === 'number' && result.insertId > 0);
                commentId = result.insertId;
            });
        });
    });
});
