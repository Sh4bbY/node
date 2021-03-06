'use strict';

const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const chai      = require('chai');
const chaiHttp  = require('chai-http');
const Mockgoose = require('mockgoose').Mockgoose;
const assert    = chai.assert;

chai.use(chaiHttp);

const Server      = require('../Server');
const MongoClient = require('../common/mongo/MongoClient');
const BlogService = require('./BlogService');

const config = {
    express: {
        protocol : 'http',
        port     : 8888,
        jwtSecret: 'LPjNP5H0#o1R(5}5r{8Iet5Bf8'
    },
    mongodb: {
        port    : 27017,
        host    : 'localhost',
        database: 'test'
    }
};

logger.setLevel('off');

describe('BlogService', () => {
    let server;
    let db;
    let service;
    let validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4ZmJmY2ZiMzQxMmYxNzRkNWIwZDFjYSIsIm5hbWUiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAdXNlci5kZSIsImlhdCI6MTQ5MjkwOTMwN30.BhcL3atRuQroLTYwR1kDQQo6Vh6ZnV-sY0QKgxhf9DI';
    let validBlogPostId;
    
    before(() => {
        const mockgoose = new Mockgoose(mongoose);
        return mockgoose.prepareStorage().then(() => {
            server = new Server(config.express);
            db     = new MongoClient(config.mongodb);
            server.registerDb('mongo', db);
            service = new BlogService(server);
            server.registerService(service);
            server.start();
        });
    });
    
    after((done) => {
        server.stop().then(() => done());
    });
    
    describe('handleCreateBlogPost', () => {
        it('should return status 400 if the request was invalid', (done) => {
            const body = {};
            chai.request(server.app)
                .post('/api/blog/post')
                .set('Authorization', 'Bearer ' + validToken)
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
        
        it('should return status 200 if the request was valid', (done) => {
            const body = {
                author: {
                    id   : 'some',
                    name : 'some',
                    email: 'some@mail.de'
                },
                title : 'some long enough title',
                body  : 'lorem ipsum dolor mit at asdas a as asd r'
            };
            chai.request(server.app)
                .post('/api/blog/post')
                .set('Authorization', 'Bearer ' + validToken)
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.hasOwnProperty(res.body, '_id');
                    validBlogPostId = res.body._id;
                    done();
                });
        });
    });
    
    describe('handleFetchBlogPosts', () => {
        it('should return status 400 if the request was invalid', (done) => {
            chai.request(server.app)
                .get('/api/blog/posts?offset=asd')
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
        
        it('should return status 200 if the request was valid', (done) => {
            chai.request(server.app)
                .get('/api/blog/posts')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });
    
    describe('handleFetchBlogPost', () => {
        it('should return status 400 if the request was invalid', (done) => {
            chai.request(server.app)
                .get('/api/blog/post/invalid_id')
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
        
        it('should return status 404 if the post could not be found', (done) => {
            chai.request(server.app)
                .get('/api/blog/post/abababababababababababab')
                .end((err, res) => {
                    assert.equal(res.status, 404);
                    done();
                });
        });
        
        it('should return status 200 if the request was valid', (done) => {
            chai.request(server.app)
                .get('/api/blog/post/' + validBlogPostId)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });
    
    describe('handleUpdateBlogPost', () => {
        it('should return status 400 if the request was invalid', (done) => {
            const body = {};
            chai.request(server.app)
                .put('/api/blog/post/invalid_Id')
                .set('Authorization', 'Bearer ' + validToken)
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
        
        it('should return status 200 if the request was valid', (done) => {
            const post = {
                title: 'This is a title changed by a test..',
                body : '...and the Body was also changed by this test!'
            };
            chai.request(server.app)
                .put('/api/blog/post/' + validBlogPostId)
                .set('Authorization', 'Bearer ' + validToken)
                .send(post)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.title, post.title);
                    assert.equal(res.body.body, post.body);
                    done();
                });
        });
    });
    
    describe('handleDeleteBlogPost', () => {
        it('should return status 400 if the request was invalid', (done) => {
            chai.request(server.app)
                .delete('/api/blog/post/asdasd')
                .set('Authorization', 'Bearer ' + validToken)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
        
        it('should return status 200 if the request was valid', (done) => {
            chai.request(server.app)
                .delete('/api/blog/post/' + validBlogPostId)
                .set('Authorization', 'Bearer ' + validToken)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });
});
