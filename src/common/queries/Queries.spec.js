'use strict';

const assert         = require('assert');
const logger         = require('log4js').getLogger('server');
const mongoose       = require('mongoose');
const Mockgoose      = require('mockgoose').Mockgoose;
const Database       = require('../Database');
const DefaultQueries = require('./Queries');

logger.setLevel('off');

describe('Queries', () => {
    let query;
    let item, item2;
    let db;
    let id;
    let id2;
    
    before(() => {
        const mockgoose = new Mockgoose(mongoose);
        return mockgoose.prepareStorage().then(() => {
            const config = {
                'port'    : 27017,
                'host'    : 'localhost',
                'database': 'test'
            };
            
            db = new Database(config);
            db.connect();
            
            query = new DefaultQueries(db.query.revoked.model);
            item  = {token: 'AToken'};
            item2 = {token: 'BToken'};
        });
    });
    
    describe('add', () => {
        it(`should add an item`, () => {
            return query.add(item).then(doc => {
                assert.ok(doc._id);
                id = doc._id;
            });
        });
        
        it(`should add another item`, () => {
            return query.add(item2).then(doc => {
                assert.ok(doc._id);
                id2 = doc._id;
            });
        });
    });
    
    describe('getById', () => {
        it(`should get an document by id`, () => {
            return query.getById(id2).then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.token, item2.token);
            });
        });
    });
    
    describe('getByOne', () => {
        it(`should get first matching document`, () => {
            return query.getOne({token: item2.token}).then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.token, item2.token);
            });
        });
    });
    
    describe('get', () => {
        it(`should get all documents`, () => {
            return query.get().then(docs => {
                assert.ok(docs instanceof Array);
                assert.ok(docs.length === 2);
                assert.equal(docs[0].token, item.token);
                assert.equal(docs[1].token, item2.token);
            });
        });
        
        it(`should get all documents limited by 1`, () => {
            return query.get({limit: 1}).then(docs => {
                assert.ok(docs instanceof Array);
                assert.equal(docs.length, 1);
                assert.equal(docs[0].token, item.token);
            });
        });
        
        it(`should get all documents with offset 1 limited by 1`, () => {
            return query.get({offset: 1, limit: 1}).then(docs => {
                assert.ok(docs instanceof Array);
                assert.equal(docs.length, 1);
                assert.equal(docs[0].token, item2.token);
            });
        });
        
        it(`should get all documents ordered by property token in descending order`, () => {
            return query.get({sort: {token: 'desc'}}).then(docs => {
                assert.ok(docs instanceof Array);
                assert.equal(docs.length, 2);
                assert.equal(docs[0].token, item2.token);
            });
        });
    });
    
    describe('removeById', () => {
        it(`should remove the item and resolve if the item was found`, () => {
            return query.removeById(id).then(() => {
                assert.ok(true);
            });
        });
        
        it(`should fail to remove the item and reject if the item could not be found`, () => {
            return query.removeById('invalidId').catch(() => {
                assert.ok(true);
            });
        });
    });
});
