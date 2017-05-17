'use strict';

const mysql  = require('mysql');
const Joi    = require('joi');
const logger = require('log4js').getLogger('server');

module.exports = class Queries {
    constructor(client) {
        this.client = client;
    }
    
    createUser(user) {
        const schema = Joi.object().keys({
            UserName    : Joi.string().min(4).max(45).required(),
            EmailAddress: Joi.string().email().min(5).max(60).required(),
            FirstName   : Joi.string().min(2).max(45),
            LastName    : Joi.string().min(2).max(45)
        }).required();
        
        const validation = Joi.validate(user, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        const query = 'INSERT INTO `Users` SET ?';
        return this.client.query(query, user);
    }
};

