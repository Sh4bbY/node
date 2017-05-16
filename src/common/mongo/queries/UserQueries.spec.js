'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const Database  = require('../MongoClient');

logger.setLevel('off');

describe('UserQueries', () => {
    let db;
    
    const user = {
        name    : 'dummy',
        email   : 'someEmail',
        password: 'somePw'
    };
    
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
        });
    });
    
    describe('createUser', () => {
        it(`should create the user "${user.name}" and resolve it`, () => {
            return db.query.user.create(user).then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.name, user.name);
                assert.equal(doc.email, user.email.toLowerCase());
            });
        });
    });
    
    describe('containsName', () => {
        it(`should resolve true if the name matches`, () => {
            return db.query.user.containsName(user.name.toUpperCase()).then(isContained => {
                assert.ok(isContained);
            });
        });
        
        it(`should resolve false if the name does not match`, () => {
            return db.query.user.containsName('unkownName').then(isContained => {
                assert.ok(!isContained);
            });
        });
    });
    
    describe('containsNameOrEmail', () => {
        it(`should resolve true if the name matches (ignore case)`, () => {
            return db.query.user.containsNameOrEmail(user.name.toUpperCase(), 'unkown@mail.com').then(isContained => {
                assert.ok(isContained);
            });
        });
        
        it(`should resolve true if the email matches (ignore case)`, () => {
            return db.query.user.containsNameOrEmail('unknownName', user.email.toUpperCase()).then(isContained => {
                assert.ok(isContained);
            });
        });
        
        it(`should resolve false if nothing matches`, () => {
            return db.query.user.containsNameOrEmail('unknownName', 'unkown@mail.com').then(isContained => {
                assert.ok(!isContained);
            });
        });
    });
});
