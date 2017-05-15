'use strict';

const mongoose    = require('mongoose');
const logger      = require('log4js').getLogger('server');
const schemata    = require('./schemata');
const Queries     = require('./queries/Queries');
const BlogQueries = require('./queries/BlogQueries');
const UserQueries = require('./queries/UserQueries');
const TodoQueries = require('./queries/TodoQueries');
mongoose.Promise  = Promise;

module.exports = class Database {
    constructor(config) {
        this.config = config;
        this.model  = {};
        
        Object.keys(schemata).forEach(key => {
            if (mongoose.models[key]) {
                this.model[key] = mongoose.model(key);
                return;
            }
            const schema    = new mongoose.Schema(schemata[key]);
            this.model[key] = mongoose.model(key, schema);
        });
        
        this.query = {
            blog    : new BlogQueries(this.model.Post),
            user    : new UserQueries(this.model.User),
            todo    : new TodoQueries(this.model.Todo),
            feedback: new Queries(this.model.Feedback),
            chat    : new Queries(this.model.Chat),
            revoked : new Queries(this.model.RevokedToken),
            tweet   : new Queries(this.model.Tweet)
        };
    }
    
    connect() {
        if (!mongoose.connection.readyState) {
            return mongoose.connect(`mongodb://${this.config.host}:${this.config.port}/${this.config.database}`);
        }
    }
    
    disconnect() {
        return mongoose.connection.close();
    }
    
    cleanUp() {
        const removePromises = Object.keys(this.model).map(key => this.model[key].collection.remove({}));
        return Promise.all(removePromises);
    }
};
