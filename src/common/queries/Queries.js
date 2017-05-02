'use strict';

const mongoose = require('mongoose');
const logger   = require('log4js').getLogger('server');

module.exports = class Queries {
    constructor(model) {
        this.model = model;
    }
    
    add(data) {
        return new Promise((resolve, reject) => {
            const model = new this.model(data);
            model.save((err, doc) => {
                if (err) {
                    return reject(err);
                }
                return resolve(doc);
            });
        });
    }
    
    update(id, data) {
        return new Promise((resolve, reject) => {
            this.model.findByIdAndUpdate(id, {$set: data}, {new: true}, (err, doc) => {
                if (err) {
                    return reject(err);
                }
                return resolve(doc);
            })
        });
    }
    
    getById(id) {
        return new Promise((resolve, reject) => {
            this.model.findById(id).exec((err, doc) => {
                if (err || !doc) {
                    reject(err);
                }
                resolve(doc);
            });
        });
    }
    
    getOne(param) {
        return new Promise((resolve, reject) => {
            this.model.findOne(param).exec((err, doc) => {
                if (err || !doc) {
                    reject(err);
                }
                resolve(doc);
            });
        });
    }
    
    get(options) {
        return new Promise((resolve, reject) => {
            const selector = options ? options.find || {} : {};
            let query = this.model.find(selector);
            if (options instanceof Object) {
                if (options.hasOwnProperty('sort')) {
                    query = query.sort(options.sort);
                }
                if (options.hasOwnProperty('offset')) {
                    query = query.skip(options.offset);
                }
                if (options.hasOwnProperty('limit')) {
                    query = query.limit(options.limit);
                }
            }
            query.exec((err, docs) => {
                if (err) {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }
    
    contains(item) {
        return new Promise((resolve) => {
            this.model.findOne(item).then(doc => {
                return resolve(!!doc);
            });
        });
    }
    
    removeById(id) {
        return new Promise((resolve, reject) => {
            this.model.findByIdAndRemove(id, (err, doc) => {
                if (err) {
                    reject(err);
                }
                resolve(doc);
            });
        });
    }
    
    remove(item) {
        return new Promise((resolve, reject) => {
            this.model.find(item).remove().exec((err, doc) => {
                if (err) {
                    reject(err);
                }
                resolve(doc);
            });
        });
    }
};
