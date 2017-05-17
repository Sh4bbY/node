'use strict';

const mysql             = require('mysql');
const Joi               = require('joi');
const logger            = require('log4js').getLogger('server');
const CredentialQueries = require('./CredentialQueries');

module.exports = class UserQueries {
    constructor(client) {
        this.client          = client;
        this.credentialQuery = new CredentialQueries(client);
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
    
    registerUser(user, password) {
        const credentials = {
            Password: password,
            UserName: user.UserName
        };
        return this.createUser(user)
            .then(result => credentials.RelatedUserID = result.insertId)
            .then(() => this.credentialQuery.createCredentials(credentials));
    }
    
    
    getUserById(id) {
        const query = 'SELECT * FROM `Users` WHERE `ID` = ?';
        return this.client.query(query, [id]).then(results => results[0]);
    }
    
    getUsers(opts) {
        const postfix = createOrderLimitOffsetPostfix(opts);
        const query   = 'SELECT * FROM `Users` ' + postfix;
        
        return this.client.query(query);
    }
    
    removeAllUsers() {
        const query = 'DELETE FROM `Users`';
        return this.client.query(query);
    }
};


function createOrderLimitOffsetPostfix(opts) {
    let order  = '';
    let limit  = '';
    let offset = '';
    
    if (opts.order && opts.order.by) {
        order = 'ORDER BY ' + mysql.escape(opts.order.by);
        if (opts.order.direction) {
            order += ' ' + mysql.escape(opts.order.direction);
        }
    }
    if (opts.limit) {
        limit = 'LIMIT ' + mysql.escape(opts.limit);
    }
    if (opts.offset) {
        offset = 'OFFSET ' + mysql.escape(opts.offset);
    }
    return `${order} ${limit} ${offset}`;
}
