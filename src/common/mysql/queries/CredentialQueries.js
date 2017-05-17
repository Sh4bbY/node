'use strict';

const mysql   = require('mysql');
const Joi     = require('joi');
const bcrypt  = require('bcrypt');
const logger  = require('log4js').getLogger('server');
const Queries = require('./Queries');

const SALT_ROUNDS = 10;

module.exports = class CredentialQueries {
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
    
    createCredentials(credentials) {
        const schema = Joi.object().keys({
            Password     : Joi.string().min(4).max(60).required(),
            UserName     : Joi.string().min(4).max(45).required(),
            RelatedUserID: Joi.number().required()
        }).required();
        
        const validation = Joi.validate(credentials, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        return bcrypt.genSalt(SALT_ROUNDS).then((salt) => {
            return bcrypt.hash(credentials.Password, salt).then(hash => {
                const record = {
                    UserName     : credentials.UserName,
                    RelatedUserID: credentials.RelatedUserID,
                    PasswordHash : hash,
                    PasswordSalt : salt
                };
                const query  = 'INSERT INTO `Credentials` SET ?';
                return this.client.query(query, record);
            });
        });
    }
    
    checkCredentials(username, password) {
        const schema = Joi.object().keys({
            username: Joi.string().min(4).max(45).required(),
            password: Joi.string().min(4).max(60).required()
        }).required();
        
        const validation = Joi.validate({username, password}, schema);
        
        if (validation.error) {
            return Promise.reject(validation.error);
        }
        
        const query = 'SELECT PasswordHash, RelatedUserID FROM `Credentials` WHERE UserName = ?';
        return this.client.query(query, username)
            .then(rows => {
                if (rows.length !== 1) {
                    return Promise.reject('unknown user');
                }
                
                const hash   = rows[0].PasswordHash;
                const userId = rows[0].RelatedUserID;
                
                return bcrypt.compare(password, hash).then(isValid => {
                    if (isValid) {
                        return Promise.resolve(userId);
                    }
                    return Promise.reject('invalid credentials');
                });
            });
    }
};
