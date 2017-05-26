'use strict';

const mysql  = require('mysql');
const Joi    = require('joi');
const bcrypt = require('bcrypt');
const logger = require('log4js').getLogger('server');

const SALT_ROUNDS = 10;

module.exports = class UserQueries {
    constructor(client) {
        this.client = client;
    }
    
    createUser(user, password) {
        const schema = Joi.object().keys({
            user    : Joi.object().keys({
                UserName    : Joi.string().min(4).max(45).required(),
                EmailAddress: Joi.string().email().min(5).max(60).required(),
                FirstName   : Joi.string().min(2).max(45),
                LastName    : Joi.string().min(2).max(45)
            }),
            password: Joi.string().min(4).max(60).required()
        }).required();
        
        const validation = Joi.validate({user, password}, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        return bcrypt.genSalt(SALT_ROUNDS).then((salt) => {
            return bcrypt.hash(password, salt).then(hash => {
                user.PasswordHash = hash;
                const query  = 'INSERT INTO `Users` SET ?';
                return this.client.query(query, user);
            });
        });
    }
    
    updateUser(id, user) {
        const schema = Joi.object().keys({
            id  : Joi.number().required(),
            user: Joi.object().keys({
                UserName    : Joi.string().min(4).max(45).required(),
                EmailAddress: Joi.string().email().min(5).max(60).required(),
                FirstName   : Joi.string().min(2).max(45),
                LastName    : Joi.string().min(2).max(45)
            })
        }).required();
        
        const validation = Joi.validate({id, user}, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        const query = 'UPDATE `Users` SET ? WHERE ID = ?';
        return this.client.query(query, [user, id]);
    }
    
    loginUser(username, password) {
        const schema = Joi.object().keys({
            username: Joi.string().min(4).max(45).required(),
            password: Joi.string().min(4).max(60).required()
        }).required();
    
        const validation = Joi.validate({username, password}, schema);
    
        if (validation.error) {
            return Promise.reject(validation.error);
        }
    
        const query = `SELECT ID, PasswordHash FROM Users WHERE UserName = ? AND IsDeleted = 0`;
        return this.client.query(query, username)
            .then(rows => {
                if (rows.length !== 1) {
                    return Promise.reject('unknown user');
                }
            
                const hash   = rows[0].PasswordHash;
                const userId = rows[0].ID;
            
                return bcrypt.compare(password, hash).then(isValid => {
                    if (isValid) {
                        return Promise.resolve(userId);
                    }
                    return Promise.reject('invalid credentials');
                });
            });
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
    
    removeUser(userId) {
        return this.client.query('UPDATE `Users` SET IsDeleted = 1, DeletedAt = CURRENT_TIMESTAMP WHERE ID = ?', userId);
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
