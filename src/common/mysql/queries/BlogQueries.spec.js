'use strict';

const assert      = require('assert');
const logger      = require('log4js').getLogger('server');
const MysqlClient = require('../MysqlClient');
const UserQueries = require('./UserQueries');
const BlogQueries = require('./BlogQueries');

//logger.setLevel('off');

xdescribe('BlogQueries (Mysql)', () => {
    let client;
    let blogQuery, userQuery;
    let userId, postId, tagId;
    
    before(() => {
        const config = {
            port    : 3306,
            host    : 'localhost',
            database: 'mydb',
            user    : 'root',
            password: ''
        };
        const user   = {
            UserName    : 'BlogJohnny',
            FirstName   : 'John',
            LastName    : 'Doe',
            EmailAddress: 'JohnDoe@localhost.com'
        };
        
        client    = new MysqlClient(config);
        blogQuery = new BlogQueries(client);
        userQuery = new UserQueries(client);
        return blogQuery.removeAllTags()
            .then(() => blogQuery.removeAllPosts())
            .then(() => userQuery.removeAllUsers())
            .then(() => userQuery.createUser(user))
            .then(result => userId = result.insertId);
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
            const tags = [tagId];
            return blogQuery.updatePost(postId, post, tags).then(result => {
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
