'use strict';

const Queries = require('./Queries');
const logger  = require('log4js').getLogger('server');

module.exports = class TodoQueries extends Queries {
    addList(title) {
        return super.add({title: title, items: []});
    }
    
    updateList(listId, title) {
        return super.update(listId, {title: title});
    }
    
    addItem(listId, text) {
        return new Promise((resolve) => {
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
                if (!item) {
                    return reject(`item with id ${itemId} could not be found`);
                }
                item.text = text;
                doc.save(() => {
                    resolve(item);
                });
            });
        });
    }
    
    toggleItem(listId, itemId) {
        return new Promise((resolve, reject) => {
            this.model.findById(listId).then(doc => {
                const item = doc.items.id(itemId);
                if (!item) {
                    return reject(`item with id ${itemId} could not be found`);
                }
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
                if (!item) {
                    return reject(`item with id ${itemId} could not be found`);
                }
                doc.items.pull(item);
                doc.save(() => {
                    resolve(item);
                })
            });
        });
    }
    
    removeList(listId) {
        return super.removeById(listId);
    }
};
