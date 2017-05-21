'use strict';

const mysql  = require('mysql');
const Joi    = require('joi');
const logger = require('log4js').getLogger('server');

module.exports = class BlogQueries {
    constructor(client) {
        this.client = client;
    }
    
    createPost(post) {
        const schema = Joi.object().keys({
            Title        : Joi.string().min(3).max(100).required(),
            Content      : Joi.string().min(5).required(),
            RelatedUserID: Joi.number().required()
        }).required();
        
        const validation = Joi.validate(post, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        const query = 'INSERT INTO `Posts` SET ?';
        return this.client.query(query, post);
    }
    
    updatePost(postId, post, tags) {
        const schema = Joi.object().keys({
            postId: Joi.number().required(),
            post  : Joi.object().keys({
                Title        : Joi.string().min(3).max(100),
                Content      : Joi.string().min(5),
                Status       : Joi.string(),
                RelatedUserID: Joi.number()
            }).required(),
            tags  : Joi.array().items(Joi.number())
        }).required();
        
        const validation = Joi.validate({postId, post, tags}, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        if (tags && tags.length > 0) {
            tags.forEach(tagId => this.linkTag(postId, tagId));
        }
        
        const query = 'UPDATE `Posts` SET ? WHERE ID = ?';
        return this.client.query(query, [post, postId]);
    }
    
    removeAllPosts() {
        return this.client.query('DELETE FROM `Posts`');
    }
};
