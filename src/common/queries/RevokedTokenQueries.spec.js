'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const Database  = require('../Database');
const mockgoose = new Mockgoose(mongoose);

logger.setLevel('off');

describe('RevokedTokenQueries', () => {
    let db;
    const token = 'SOME DUMMY TOKEN';
    
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
    
    describe('add', () => {
        it(`should add a new token to the revoked tokens and resolve to true`, () => {
            return db.query.revoked.add(token).then(isAdded => {
                assert.ok(isAdded);
            });
        });
    });
    
    describe('contains', () => {
        it(`should check that the token is known as revoked and resolve to true`, () => {
            return db.query.revoked.contains(token).then(isRevoked => {
                assert.ok(isRevoked)
            });
        });
        
        it(`should check that the token is not known as revoked and resolve to false`, () => {
            return db.query.revoked.contains('Some unknown token').then(isRevoked => {
                assert.ok(!isRevoked);
            });
        });
    });
    
    describe('remove', () => {
        it(`should remove the token from the known revoked tokens and resolve to true`, () => {
            return db.query.revoked.remove(token).then(isRemoved => {
                assert.ok(isRemoved);
            });
        });
    });
});
