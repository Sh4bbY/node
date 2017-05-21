'use strict';

const mysql  = require('mysql');
const Joi    = require('joi');
const logger = require('log4js').getLogger('server');

module.exports = class TagQueries {
    constructor(client) {
        this.client = client;
    }
    
    getOrCreateTag(tag) {
        const schema     = Joi.string().min(3).max(45).required();
        const validation = Joi.validate(tag, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        const query = 'SELECT ID FROM `Tags` WHERE Name = ?';
        return this.client.query(query, tag)
            .then(rows => {
                if (rows.length > 0) {
                    return Promise.resolve(rows[0].ID);
                }
                return this.client.query('INSERT INTO `Tags` SET Name = ?', tag)
                    .then(result => Promise.resolve(result.insertId));
            });
    }
    
    linkTag(postId, tagId) {
        const schema     = Joi.object().keys({
            RelatedPostID: Joi.number().required(),
            RelatedTagID : Joi.number().required()
        }).required();
        const relation   = {RelatedPostID: postId, RelatedTagID: tagId};
        const validation = Joi.validate(relation, schema);
        
        if (validation.error) {
            validation.error.details.forEach(err => logger.error(err.message));
            return Promise.reject(validation.error);
        }
        
        return this.client.query('INSERT INTO `Posts_has_Tags` SET ?', relation)
    }
    
    removeTag(tagId) {
        const schema     = Joi.number().required();
        const validation = Joi.validate(tagId, schema);
        
        if (validation.error) {
            return Promise.reject(validation.error);
        }
        
        return this.client.query('DELETE FROM `Posts_has_Tags` WHERE ID = ?', tagId);
    }
    
    removeAllTags() {
        return this.client.query('DELETE FROM `Tags`');
    }
};
