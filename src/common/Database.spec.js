'use strict';

const assert    = require('chai').assert;
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

let Database;
let db;
logger.setLevel('off');

describe('Database', () => {
    before((done) => {
        mockgoose.prepareStorage().then(() => {
            const config = {
                'port'    : 27017,
                'host'    : 'localhost',
                'database': 'test'
            };
            Database     = require('./Database');
            db           = new Database(config);
            done();
        });
    });
    
    describe('connect', () => {
        it('should connect', () => {
            db.connect();
        });
    });
    
    describe('cleanUp', () => {
        it('cleans Up', () => {
            db.cleanUp();
        });
    });
    
    describe('createUser', () => {
        it('creates a User', (done) => {
            const user = {
                name    : 'dummy',
                email   : 'someEmail',
                password: 'somePw'
            };
            db.createUser(user).then(record => {
                assert.hasOwnProperty(record, '_id');
                done();
            });
        });
    });
    
    describe('findUserByName', () => {
        it('findUserByName', () => {
            db.findUserByName('dummy').then(record => {
                assert.hasOwnProperty(record, '_id');
            });
        });
    });
    
    describe('createBlogPost', () => {
        it('creates a BlogPost', (done) => {
            const data = {
                author: {
                    name : 'some',
                    email: 'some',
                    id   : 'some'
                },
                title : 'some',
                body  : 'some'
            };
            db.createBlogPost(data).then(postRecord => {
                assert.hasOwnProperty(postRecord, '_id');
                done();
            });
        });
    });
    
    describe('fetchBlogPosts', () => {
        it('creates a BlogPost', (done) => {
            db.fetchBlogPosts().then(postRecords => {
                assert.instanceOf(postRecords, Array);
                done();
            });
        });
    });
    
    describe('disconnect', () => {
        it('should disconnect', () => {
            db.disconnect();
        });
    });
});
