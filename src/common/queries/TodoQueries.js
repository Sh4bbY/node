'use strict';

const logger = require('log4js').getLogger('server');

module.exports = class TodoQueries {
    constructor(model) {
        this.model = model;
    }
    
    addList(title) {
        return new Promise((resolve, reject) => {
            const todoModel = new this.model({title: title, items: []});
            todoModel.save((err, doc) => {
                if (err) {
                    return reject(err);
                }
                
                logger.info(`added todo-list "${doc.title}"`);
                return resolve(doc);
            });
        });
    }
    
    updateList(listId, title) {
        return new Promise((resolve, reject) => {
            this.model.findByIdAndUpdate(listId, {$set: {title: title}}, {new: true}, (err, doc) => {
                logger.debug(`updated todo-list title to "${doc.title}"`);
                return resolve(doc);
            });
        });
    }
    
    addItem(listId, text) {
        return new Promise((resolve, reject) => {
            this.model.findById(listId).then(doc => {
                doc.items.push({
                    text    : text,
                    complete: false
                });
                doc.save(() => {
                    resolve(doc.items[doc.items.length - 1]);
                });
            });
        });
    }
    
    updateItem(listId, itemId, text) {
        return new Promise((resolve, reject) => {
            this.model.findById(listId).then(doc => {
                const item = doc.items.id(itemId);
                item.text  = text;
                doc.save(() => {
                    resolve(item);
                });
            });
        });
    }
    
    
    toggleItem(listId, itemId) {
        return new Promise((resolve, reject) => {
            this.model.findById(listId).then(doc => {
                const item    = doc.items.id(itemId);
                item.complete = !item.complete;
                
                doc.save(() => {
                    resolve(item);
                });
            });
        });
    }
    
    removeItem(listId, itemId) {
        return new Promise((resolve, reject) => {
            this.model.findById(listId).then(doc => {
                const item = doc.items.id(itemId);
                doc.items.pull(item);
                doc.save(() => {
                    resolve(item);
                })
            });
        });
    }
    
    removeList(listId) {
        return new Promise((resolve, reject) => {
            this.model.findByIdAndRemove(listId, (err, doc) => {
                if (err) {
                    rejcet(err);
                }
                resolve(doc);
            });
        });
    }
}
;
