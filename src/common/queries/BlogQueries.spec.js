'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);
const Database  = require('../Database');

logger.setLevel('off');

describe('BlogQueries', () => {
    const post = {
        author: {
            name : 'some',
            email: 'some',
            id   : 'some'
        },
        title : 'some',
        body  : 'some'
    };
    let db;
    let postId;
    
    before(() => {
        return mockgoose.prepareStorage().then(() => {
            const config = {
                'port'    : 27017,
                'host'    : 'localhost',
                'database': 'test'
            };
            
            db = new Database(config);
            db.connect();
        });
    });
    
    describe('createPost', () => {
        it('should create a new post and resolve it', () => {
            return db.query.blog.createPost(post).then(doc => {
                assert.ok(doc._id);
                postId = doc._id;
                assert.equal(doc.title, post.title);
            });
        });
    });
    
    describe('fetchBlogPosts', () => {
        it('should resolve an array of all posts', () => {
            return db.query.blog.fetchPosts().then(docs => {
                assert.equal(docs.length, 1);
                assert.equal(docs[0].body, post.body);
            });
        });
    });
    
    describe('fetchBlogPost', () => {
        it(`should resolve the post with id ${postId}`, () => {
            return db.query.blog.fetchPost(postId).then(doc => {
                assert.equal(String(doc._id), String(postId));
                assert.equal(doc.name, post.name);
            });
        });
    });
    
    describe('updateBlogPost', () => {
        it(`should update the post with id ${postId} and resolve it`, () => {
            const data = {title: 'foo', body: 'bar'};
            return db.query.blog.updatePost(postId, data).then(doc => {
                assert.equal(String(doc._id), String(postId));
                assert.equal(doc.body, data.body);
                assert.equal(doc.title, data.title);
            });
        });
    });
    
    describe('deleteBlogPost', () => {
        it(`should delete the post with id ${postId}`, () => {
            return db.query.blog.deletePost(postId).then(db.query.blog.fetchPosts()
                .then((docs) => {
                    assert.equal(docs.length, 0);
                }));
        });
    });
});
