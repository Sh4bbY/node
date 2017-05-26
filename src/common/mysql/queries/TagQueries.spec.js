'use strict';

const assert      = require('assert');
const logger      = require('log4js').getLogger('server');
const MysqlClient = require('../MysqlClient');
const UserQueries = require('./UserQueries');
const BlogQueries = require('./BlogQueries');
const TagQueries  = require('./TagQueries');

//logger.setLevel('off');

describe('TagQueries (Mysql)', () => {
    let client;
    let blogQuery, userQuery, tagQuery;
    let userId, postId, tagId;
    
    before(() => {
        const config   = {
            port    : 3306,
            host    : 'localhost',
            database: 'mydb',
            user    : 'root',
            password: 'root-secret-pw'
        };
        const user     = {
            UserName    : 'TagJohnny',
            FirstName   : 'John',
            LastName    : 'Doe',
            EmailAddress: 'TagJohnny@test.com'
        };
        const password = 'mySecretPassword';
        
        const post = {
            Title  : 'Unit test for creating a blog post is working',
            Content: 'Lorem ipsum dolor sit amed.'
        };
        
        client    = new MysqlClient(config);
        blogQuery = new BlogQueries(client);
        userQuery = new UserQueries(client);
        tagQuery  = new TagQueries(client);
        return userQuery.createUser(user, password)
            .then(result => {
                userId             = result.insertId;
                post.RelatedUserID = userId;
            })
            .then(() => blogQuery.createPost(post))
            .then(result => postId = result.insertId);
    });
    
    describe('getOrCreateTag', () => {
        it('should create a tag', () => {
            return tagQuery.getOrCreateTag('UnitTest').then(resultId => {
                assert((typeof resultId) === 'number' && resultId > 0);
                tagId = resultId;
            });
        });
        
        it('should get the former created tag', () => {
            return tagQuery.getOrCreateTag('UnitTest').then(resultId => {
                assert.equal(resultId, tagId);
            });
        });
    });
    
    describe('linkTag', () => {
        it('should link a post to a tag', () => {
            return tagQuery.linkTag(postId, tagId).then(result => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 0);
            });
        });
    });
    
    describe('removeTag', () => {
        it('should delete the tag', () => {
            return tagQuery.removeTag(tagId).then(result => {
                assert.equal(result.affectedRows, 1);
                assert.equal(result.warningCount, 0);
                assert.equal(result.changedRows, 0);
            });
        });
    });
});
