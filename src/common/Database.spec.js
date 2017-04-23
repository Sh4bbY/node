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
            Database = require('./Database');
            db       = new Database();
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
            const db = new Database();
            db.cleanUp();
        });
    });
    
    describe('findUserByName', () => {
        it('findUserByName', () => {
            const db = new Database();
            db.findUserByName();
        });
    });
    
    describe('createUser', () => {
        it('creates a User', (done) => {
            const user = {
                name    : 'dummy',
                email   : 'someEmail',
                password: 'somePw'
            };
            db.createUser(user).then(userRecord => {
                assert.hasOwnProperty(userRecord, '_id');
                done();
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
