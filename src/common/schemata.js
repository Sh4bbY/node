'use strict';

module.exports = {
    User: {
        name         : String,
        password_hash: String,
        email        : String,
        createdAt    : Date
    },
    Post: {
        author   : {
            name : String,
            email: String,
            id   : String
        },
        title    : String,
        body     : String,
        createdAt: Date
    }
};
