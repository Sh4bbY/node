'use strict';

const logger = require('log4js').getLogger('server');

module.exports = class BlogQueries {
    constructor(model) {
        this.model = model;
    }
    
    createPost(blogPostData) {
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
            
            const newPost = new this.model(storageData);
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
    
    fetchPosts(data) {
        return new Promise((resolve, reject) => {
            this.model.find({})
                .sort({createdAt: 'desc'})
                .exec((err, docs) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(docs);
                });
        });
    }
    
    fetchPost(id) {
        return new Promise((resolve, reject) => {
            this.model.findById(id)
                .exec((err, doc) => {
                    if (err || !doc) {
                        reject(err);
                    }
                    resolve(doc);
                });
        });
    }
    
    updatePost(id, data) {
        return new Promise((resolve, reject) => {
            this.model.findByIdAndUpdate(id, {$set: data}, {new: true}, (err, doc) => {
                if (err) {
                    return reject(err);
                }
                return resolve(doc);
            })
        });
    }
    
    deletePost(id) {
        return new Promise((resolve, reject) => {
            this.model.remove({_id: id}, (err, doc) => {
                if (err) {
                    return reject(err);
                }
                return resolve(doc);
            });
        });
    }
};
