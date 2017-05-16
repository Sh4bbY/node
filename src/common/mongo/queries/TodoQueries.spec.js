'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const Database  = require('../MongoClient');

logger.setLevel('off');

describe('TodoQueries', () => {
    let db;
    let listId;
    let itemId;
    
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
    
    describe('addList', () => {
        it(`should create a new todo-list and resolve that list`, () => {
            return db.query.todo.addList('my list name').then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.title, 'my list name');
                listId = doc._id;
            });
        });
    });
    
    describe('updateList', () => {
        it(`should update the title of a list and resolve that list`, () => {
            return db.query.todo.updateList(listId, 'my updated list name').then(doc => {
                assert.equal(String(doc._id), String(listId));
                assert.equal(doc.title, 'my updated list name');
            });
        });
    });
    
    describe('addItem', () => {
        it(`should add a new item to list and resolve that item`, () => {
            return db.query.todo.addItem(listId, 'something I need to do').then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.text, 'something I need to do');
                itemId = doc._id;
            });
        });
    });
    
    describe('updateItem', () => {
        it(`should update the text from a item in a list and resolve that item`, () => {
            return db.query.todo.updateItem(listId, itemId, 'FooBar').then(doc => {
                assert.equal(String(doc._id), String(itemId));
                assert.equal(doc.text, 'FooBar');
            });
        });
    });
    
    describe('toggleItem', () => {
        it(`should toggle the complete property from an item in a list and resolve that item`, () => {
            return db.query.todo.toggleItem(listId, itemId).then(doc => {
                assert.equal(String(doc._id), String(itemId));
                assert.equal(doc.complete, true);
            });
        });
    });
    
    describe('removeItem', () => {
        it(`should remove a item from a list and resolve that item`, () => {
            return db.query.todo.removeItem(listId, itemId).then(doc => {
                assert.equal(String(doc._id), String(itemId));
            });
        });
        
        it(`should reject the item to delete could not be found`, () => {
            return db.query.todo.removeItem(listId, '58ffd325bf8b0c4ffef1c181').catch((err) => {
                assert.ok(true);
            });
        });
    });
    
    describe('removeList', () => {
        it(`should remove the list and resolve it`, () => {
            return db.query.todo.removeList(listId).then(doc => {
                assert.ok(doc._id);
                assert.equal(doc.items.length, 0);
            });
        });
    });
});
