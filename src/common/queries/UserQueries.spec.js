'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const Database  = require('../Database');
const mockgoose = new Mockgoose(mongoose);

logger.setLevel('off');

describe('UserQueries', () => {
    let db;
    
    const user = {
        name    : 'dummy',
        email   : 'someEmail',
        password: 'somePw'
    };
    
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
    
    describe('createUser', () => {
        it(`should create the user "${user.name}" and resolve it`, () => {
            return db.query.user.create(user).then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.name, user.name);
                assert.equal(doc.email, user.email.toLowerCase());
            });
        });
    });
    
    describe('findByName', () => {
        it(`should find the user by name "${user.name}" (ignore case) and resolve it`, () => {
            return db.query.user.findByName(user.name.toUpperCase()).then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.name, user.name);
            });
        });
    });
    
    describe('findByNameOrEmail', () => {
        it(`should find the user if the name matches (ignore case) and resolve it`, () => {
            return db.query.user.findByNameOrEmail(user.name.toUpperCase(), 'unkown@mail.com').then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.name, user.name);
            });
        });
        
        it(`should find the user if the email matches (ignore case) and resolve it`, () => {
            return db.query.user.findByNameOrEmail('unknownName', user.email.toUpperCase()).then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.name, user.name);
            });
        });
    });
});
