'use strict';

const logger = require('log4js').getLogger('server');

module.exports = class RevokedTokenQueries {
    constructor(model) {
        this.model = model;
    }
    
    add(token) {
        return new Promise((resolve, reject) => {
            const tokenModel = new this.model({token: token});
            tokenModel.save((err, doc) => {
                if (err) {
                    return reject(err);
                }
                
                logger.info(`added token ${doc.token} to revoked-tokens`);
                return resolve(!!doc);
            });
        });
    }
    
    contains(token) {
        return new Promise((resolve, reject) => {
            this.model.findOne({token: token}).then(doc => resolve(!!doc));
        });
    }
    
    remove(token) {
        return new Promise((resolve, reject) => {
            this.model.remove({token: token}, err => resolve(!err));
        });
    }
};
