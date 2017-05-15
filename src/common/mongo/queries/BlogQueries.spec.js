'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const Database  = require('../Database');

logger.setLevel('off');

describe('BlogQueries', () => {
    const post = {
        author: {
            name : 'some',
            email: 'some',
            id   : 'some'
        },
        title : 'some',
        body  : 'some'
    };
    let db;
    let postId;
    
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
    
    describe('add', () => {
        it('should create a new post and resolve it', () => {
            return db.query.blog.add(post).then(doc => {
                assert.ok(doc._id);
                assert.ok(doc.createdAt instanceof Date);
                assert.equal(doc.title, post.title);
                postId = doc._id;
            });
        });
    });
});
