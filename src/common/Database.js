'use strict';

const bcrypt     = require('bcrypt');
const saltRounds = 10;
const mongoose   = require('mongoose');
const userSchema = new mongoose.Schema({
    name    : String,
    email   : String,
    password: String
});
const UserModel  = mongoose.model('User', userSchema);

module.exports = class Database {
    connect() {
        mongoose.connect('mongodb://localhost/test');
    }
    
    cleanUp() {
        UserModel.collection.drop();
    }
    
    findUserByEmail(email) {
        return UserModel.findOne({email: email});
    }
    
    createUser(userData) {
        bcrypt.hash(userData.password, saltRounds)
            .then(hash => {
                const data      = Object.assign(userData, {password: hash});
                const adminUser = new UserModel(data);
                adminUser.save(err => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('user created');
                    }
                });
            });
    }
};
