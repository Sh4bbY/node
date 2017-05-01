'use strict';

const Joi    = require('joi');
const logger = require('log4js').getLogger('server');

module.exports = class TodoService {
    constructor(server) {
        this.server = server;
        this.router = server.router;
        this.db     = server.db.mongo;
        
        this.router.get('/api/todo/lists', handleGetLists.bind(this));
        this.router.post('/api/todo/list', handleCreateList.bind(this));
        this.router.post('/api/todo/:listId/item', handleCreateItem.bind(this));
        this.router.put('/api/todo/:listId', handleUpdateList.bind(this));
        this.router.put('/api/todo/:listId/item/:itemId', handleUpdateItem.bind(this));
        this.router.put('/api/todo/:listId/item/:itemId/toggle', handleToggleItem.bind(this));
        this.router.delete('/api/todo/:listId', handleDeleteList.bind(this));
        this.router.delete('/api/todo/:listId/item/:itemId', handleDeleteItem.bind(this));
    }
};

function handleGetLists(req, res) {
    logger.debug('received valid get todo-lists request');
    this.db.query.todo.get()
        .then(lists => res.json(lists));
}

function handleCreateList(req, res) {
    logger.debug('received valid get todo-lists request');
    this.db.query.todo.addList(req.body.title)
        .then(list => res.json(list));
}

function handleCreateItem(req, res) {
    logger.debug('received valid get todo-lists request');
    this.db.query.todo.addItem(req.params.listId, req.body.text)
        .then(item => res.json(item));
}

function handleDeleteList(req, res) {
    logger.debug('received valid get todo-lists request');
    this.db.query.todo.removeList(req.params.listId)
        .then(list => res.json(list));
}
function handleDeleteItem(req, res) {
    logger.debug('received valid get todo-lists request');
    this.db.query.todo.removeItem(req.params.listId, req.params.itemId)
        .then(item => res.json(item));
}

function handleUpdateList(req, res) {
    logger.debug('received valid get todo-lists request');
    this.db.query.todo.updateList(req.params.listId, req.body.title)
        .then(list => res.json(list));
}

function handleUpdateItem(req, res) {
    logger.debug('received valid get todo-lists request');
    this.db.query.todo.updateItem(req.params.listId, req.params.itemId, req.body.text)
        .then(item => res.json(item));
}

function handleToggleItem(req, res) {
    logger.debug('received valid get todo-lists request');
    this.db.query.todo.toggleItem(req.params.listId, req.params.itemId)
        .then(item => res.json(item));
}
