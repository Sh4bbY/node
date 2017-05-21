'use strict';

const mysql  = require('mysql');
const Joi    = require('joi');
const logger = require('log4js').getLogger('server');

module.exports = class CommentQueries {
    constructor(client) {
        this.client = client;
    }
    
    createComment(comment) {
        const schema = Joi.object().keys({
            Content      : Joi.string().min(5).max(600).required(),
            RelatedUserID: Joi.number().required(),
            RelatedPostID: Joi.number().required()
        }).required();
        
        const validation = Joi.validate(comment, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        const query = 'INSERT INTO `Comments` SET ?';
        return this.client.query(query, comment);
    }
};
