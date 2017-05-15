'use strict';

const bcrypt  = require('bcrypt');
const logger  = require('log4js').getLogger('server');
const Queries = require('./Queries');

const SALT_ROUNDS = 10;

module.exports = class UserQueries extends Queries {
    
    getByName(name) {
        return super.getOne({name: {$regex: new RegExp(name, 'i')}});
    }
    
    
    containsName(name) {
        return super.contains({name: {$regex: new RegExp(name, 'i')}});
    }
    
    
    containsNameOrEmail(name, email) {
        return super.contains({
            $or: [
                {name: {$regex: new RegExp(name, 'i')}},
                {email: {$regex: new RegExp(email, 'i')}}
            ]
        });
    }
    
    create(user) {
        return bcrypt.hash(user.password, SALT_ROUNDS).then(hash => {
            const record = {
                name         : user.name,
                password_hash: hash,
                email        : user.email.toLowerCase(),
                createdAt    : Date.now()
            };
            return super.add(record);
        });
    }
};
