'use strict';

const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');
const Database   = require('../common/Database');

module.exports = class BlogService {
    constructor(server) {
        this.server = server;
        this.router = this.server.router;
        this.db     = new Database();
        this.db.connect();
        
        this.router.post('/api/blog/post',
            expressJwt({secret: this.server.config.secret}),
            BlogService._handleCreateBlogPost.bind(this));
        this.router.get('/api/blog/posts',
            BlogService._handleFetchBlogPosts.bind(this));
    }
    
    static _handleCreateBlogPost(req, res) {
        const requestSchema = Joi.object().keys({
            author: Joi.object().keys({
                id   : Joi.string().required(),
                name : Joi.string().required(),
                email: Joi.string().email().required()
            }).required(),
            title : Joi.string().min(10).max(300).required(),
            body  : Joi.string().min(20).required()
        }).required().options({abortEarly: false});
        
        const validationResult = Joi.validate(req.body, requestSchema);
        
        if (!!validationResult.error) {
            validationResult.error.details.forEach(err => logger.error(err.message));
            throw new Error('Invalid Parameters', validationResult.error);
        }
        
        logger.debug('received valid blog-post creation request');
        this.db.createBlogPost(req.body)
            .then(() => {
                res.json({status: 'success'});
            });
    }
    
    static _handleFetchBlogPosts(req, res) {
        const requestSchema = Joi.object().keys({
            offset: Joi.number().min(0),
            limit : Joi.number().min(0)
        }).required().options({abortEarly: false});
        
        const validationResult = Joi.validate(req.body, requestSchema);
        
        if (!!validationResult.error) {
            validationResult.error.details.forEach(err => logger.error(err.message));
            throw new Error('Invalid Parameters', validationResult.error);
        }
        
        logger.debug('received valid fetch blog-posts request');
        this.db.fetchBlogPosts(req.body)
            .then((result) => {
                res.json(result);
            });
    }
};
