'use strict';

const mysql  = require('mysql');
const logger = require('log4js').getLogger('server');

module.exports = class Queries {
    constructor(client) {
        this.client = client;
    }
    
    createUser(user) {
        const query = 'INSERT INTO `Users` SET ?';
        return this.client.query(query, user);
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
