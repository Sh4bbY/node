'use strict';

const chai      = require('chai');
const assert    = chai.assert;
const chaiHttp  = require('chai-http');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const Server      = require('../Server');
const BlogService = require('./BlogService');

chai.use(chaiHttp);
logger.setLevel('off');

describe('BlogService', () => {
    let server;
    let service;
    let validToken;
    
    before((done) => {
        const config = {
            'protocol': 'http',
            'port'    : 8101,
            'secret'  : 'LPjNP5H0#o1R(5}5r{8Iet5Bf8'
        };
    
        validToken   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4ZmJmY2ZiMzQxMmYxNzRkNWIwZDFjYSIsIm5hbWUiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAdXNlci5kZSIsImlhdCI6MTQ5MjkwOTMwN30.BhcL3atRuQroLTYwR1kDQQo6Vh6ZnV-sY0QKgxhf9DI';
    
        mockgoose.prepareStorage().then(() => {
            server  = new Server(config);
            service = new BlogService(server);
            server.registerService(service);
            server.start();
            done();
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
                    done();
                });
        });
    });
    
    describe('handleFetchBlogPost', () => {
        it('should return status 200 if the request was valid', (done) => {
            chai.request(server.app)
                .get('/api/blog/posts')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
        
        it('should return status 400 if the request was invalid', (done) => {
            chai.request(server.app)
                .get('/api/blog/posts')
                .send({offest: 'asd'})
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
    });
});
