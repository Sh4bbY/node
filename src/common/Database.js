'use strict';

const mongoose            = require('mongoose');
const logger              = require('log4js').getLogger('server');
const schemata            = require('./schemata');
const BlogQueries         = require('./queries/BlogQueries');
const UserQueries         = require('./queries/UserQueries');
const RevokedTokenQueries = require('./queries/RevokedTokenQueries');
const TodoQueries         = require('./queries/TodoQueries');
mongoose.Promise          = Promise;

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
            blog   : new BlogQueries(this.model.Post),
            user   : new UserQueries(this.model.User),
            revoked: new RevokedTokenQueries(this.model.RevokedToken),
            todo   : new TodoQueries(this.model.Todo)
        }
        ;
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
