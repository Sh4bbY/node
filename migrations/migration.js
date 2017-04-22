'use strict';
const Database = require('../src/common/Database');
const db       = new Database();

db.connect().then(() => {
    //db.cleanUp();
    db.createUser({
        name    : 'test',
        email   : 'admin@test.de',
        password: 'test'
    });
    // db.disconnect();
});

