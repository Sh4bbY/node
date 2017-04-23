'use strict';

const mongoose   = require('mongoose');
const bcrypt     = require('bcrypt');
const logger     = require('log4js').getLogger('server');
const schemata   = require('./schemata');
const saltRounds = 10;

module.exports = class Database {
    constructor(config) {
        this.config      = config;
        mongoose.Promise = Promise;
        this.model       = {};
        
        this.loadModel('User');
        this.loadModel('Post');
    }
    
    loadModel(name) {
        if (mongoose.models[name]) {
            this.model[name] = mongoose.model(name);
        } else {
            const schema     = new mongoose.Schema(schemata[name]);
            this.model[name] = mongoose.model(name, schema);
        }
    }
    
    connect() {
        if (!mongoose.connection.readyState) {
            return mongoose.connect(`mongodb://${this.config.host}:${this.config.port}/${this.config.database}`);
        }
    }
    
    disconnect() {
        mongoose.connection.close();
    }
    
    cleanUp() {
        Object.keys(this.model).forEach(key => this.model[key].collection.remove({}));
    }
    
    findUserByName(name) {
        return this.model.User.findOne({name: {$regex: new RegExp(name, 'i')}});
    }
    
    findUserByNameOrEmail(name, email) {
        return this.model.User.findOne({
            $or: [
                {name: {$regex: new RegExp(name, 'i')}},
                {email: {$regex: new RegExp(email, 'i')}}
            ]
        });
    }
    
    createUser(user) {
        return new Promise((resolve, reject) => {
            return bcrypt.hash(user.password, saltRounds).then(hash => {
                const dataRecord = {
                    name         : user.name,
                    password_hash: hash,
                    email        : user.email.toLowerCase(),
                    createdAt    : Date.now()
                };
                const userModel  = new this.model.User(dataRecord);
                userModel.save((err, savedUser) => {
                    if (err) {
                        return reject(err);
                    } else {
                        logger.info(`user ${savedUser.name} created`);
                        return resolve(savedUser);
                    }
                });
            });
        });
    }
    
    createBlogPost(blogPostData) {
        return new Promise((resolve, reject) => {
            const storageData = {
                author   : {
                    name : blogPostData.author.name,
                    email: blogPostData.author.email,
                    id   : blogPostData.author.id
                },
                title    : blogPostData.title,
                body     : blogPostData.body,
                createdAt: Date.now()
            };
            
            const newPost = new this.model.Post(storageData);
            newPost.save((err, savedPost) => {
                if (err) {
                    reject(err);
                } else {
                    logger.info('blog-post created');
                    resolve(savedPost);
                }
            });
        });
    }
    
    fetchBlogPosts(data) {
        return new Promise((resolve, reject) => {
            this.model.Post
                .find({})
                .sort({createdAt: 'desc'})
                .exec((err, docs) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(docs);
                });
        });
    }
    
    updateBlogPost(id, data) {
        return new Promise((resolve, reject) => {
            this.model.Post.findOneAndUpdate({_id: id}, {$set: data}, {new: true}, (err, doc) => {
                if (err) {
                    return reject(err);
                }
                return resolve(doc);
            })
        });
    }
    
    deleteBlogPost(id) {
        return new Promise((resolve, reject) => {
            this.model.Post.remove({_id: id}, (err, doc) => {
                if (err) {
                    return reject(err);
                }
                return resolve(doc);
            });
        });
    }
};
