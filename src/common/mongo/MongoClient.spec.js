'use strict';

const assert      = require('assert');
const logger      = require('log4js').getLogger('server');
const mongoose    = require('mongoose');
const Mockgoose   = require('mockgoose').Mockgoose;
const MongoClient = require('./MongoClient');

logger.setLevel('off');

describe('MongoClient', () => {
    let db;
    before(() => {
        const mockgoose = new Mockgoose(mongoose);
        return mockgoose.prepareStorage().then(() => {
            const config = {
                'port'    : 27017,
                'host'    : 'localhost',
                'database': 'test'
            };
            
            db = new MongoClient(config);
        });
    });
    
    describe('connect', () => {
        it('should connect to mocked mongodb', () => {
            assert.equal(mongoose.connection.readyState, false);
            
            return db.connect().then(() => {
                assert.equal(mongoose.connection.readyState, true);
            });
        });
    });
    
    describe('cleanUp', () => {
        it('should remove all documents from all collections', () => {
            const user = {
                name    : 'dummy',
                email   : 'dummy@test.de',
                password: 'somePassword'
            };
            return db.query.user.create(user)
                .then(() => db.query.user.get())
                .then(users => assert.equal(users.length, 1))
                .then(() => db.cleanUp())
                .then(() => db.query.user.get())
                .then(users => assert.equal(users.length, 0));
        });
    });
    
    describe('disconnect', () => {
        it('should disconnect from mocked mongodb', () => {
            assert.equal(mongoose.connection.readyState, true);
            db.disconnect().then(() => {
                assert.equal(mongoose.connection.readyState, false);
            });
        });
    });
});
