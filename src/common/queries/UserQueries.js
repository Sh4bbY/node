'use strict';

const bcrypt = require('bcrypt');
const logger = require('log4js').getLogger('server');

const SALT_ROUNDS = 10;

module.exports = class UserQueries {
    constructor(model) {
        this.model = model;
    }
    
    findByName(name) {
        return this.model.findOne({name: {$regex: new RegExp(name, 'i')}});
    }
    
    findByNameOrEmail(name, email) {
        return this.model.findOne({
            $or: [
                {name: {$regex: new RegExp(name, 'i')}},
                {email: {$regex: new RegExp(email, 'i')}}
            ]
        });
    }
    
    create(user) {
        return new Promise((resolve, reject) => {
            return bcrypt.hash(user.password, SALT_ROUNDS).then(hash => {
                const dataRecord = {
                    name         : user.name,
                    password_hash: hash,
                    email        : user.email.toLowerCase(),
                    createdAt    : Date.now()
                };
                const userModel  = new this.model(dataRecord);
                userModel.save((err, savedUser) => {
                    if (err) {
                        return reject(err);
                    }
                    
                    logger.info(`user ${savedUser.name} created`);
                    return resolve(savedUser);
                });
            });
        });
    }
};
