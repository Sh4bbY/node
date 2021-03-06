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
        exp  : Number
    },
    Chat        : {
        author   : String,
        message  : String,
        createdAt: Date
    },
    Tweet       : {
        id            : String,
        text          : String,
        created_at    : Date,
        retweet_count : Number,
        favorite_count: Number
    }
};
