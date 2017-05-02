'use strict';

module.exports = {
    User        : {
        name         : String,
        real_name    : String,
        password_hash: String,
        email        : String,
        createdAt    : Date,
        lastVisit    : Date,
        isVerified   : Boolean
    },
    Post        : {
        author   : {
            name : String,
            email: String,
            id   : String
        },
        title    : String,
        body     : String,
        createdAt: Date
    },
    Feedback    : {
        author : String,
        email  : String,
        type   : String,
        topic  : String,
        message: String
    },
    Todo        : {
        title: String,
        items: [{
            text    : String,
            complete: Boolean
        }]
    },
    RevokedToken: {
        token: String,
        exp: Number,
    }
};
