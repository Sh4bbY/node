'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const Database  = require('./Database')
const mockgoose = new Mockgoose(mongoose);

logger.setLevel('off');

describe('Database', () => {
    let db;
    before(() => {
        return mockgoose.prepareStorage().then(() => {
            const config = {
                'port'    : 27017,
                'host'    : 'localhost',
                'database': 'test'
            };
            
            db = new Database(config);
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
            return db.query.user.create({name: 'dummy', email: 'dummy@test.de', password: 'somePassword'})
                .then(db.query.user.findByName('dummy'))
                .then(user => {
                    assert.equal(user.name, 'dummy');
                    assert.ok(user._id);
                })
                .then(db.cleanUp())
                .then(db.query.user.findByName('dummy'))
                .then(user => {
                    assert.equal(user, undefined);
                });
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
