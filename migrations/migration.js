'use strict';
const Database = require('../src/common/mongo/MongoClient');
const config   = require('../config.json');
const db       = new Database(config.mongodb);

db.connect().then(() => {
    db.cleanUp();
    db.createUser({
        name    : 'test',
        email   : 'admin@test.de',
        password: 'test'
    }).then(() => {
        return db.createBlogPost({
            author: {
                id   : 'some',
                name : 'some',
                email: 'some@mail.de'
            },
            title : 'some long enough title',
            body  : 'lorem ipsum dolor mit at asdas a as asd r'
        });
    }).then((err) => {
        db.disconnect();
    }).catch(err => {
        console.log('migration error',err);
        db.disconnect();
    })
});

