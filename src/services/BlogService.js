'use strict';

const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');

module.exports = class BlogService {
    constructor(server) {
        this.server = server;
        this.router = server.router;
        this.db     = server.db.mongo;
        
        const protectMiddleware = expressJwt({secret: this.server.config.secret});
        
        this.router.get('/api/blog/posts', handleFetchBlogPosts.bind(this));
        this.router.get('/api/blog/post/:id', handleFetchBlogPost.bind(this));
        this.router.post('/api/blog/post', protectMiddleware, handleCreateBlogPost.bind(this));
        this.router.delete('/api/blog/post/:id', protectMiddleware, handleDeleteBlogPost.bind(this));
        this.router.put('/api/blog/post/:id', protectMiddleware, handleUpdateBlogPost.bind(this));
    }
};

function handleFetchBlogPosts(req, res) {
    const requestSchema = Joi.object().keys({
        offset: Joi.number().min(0),
        limit : Joi.number().min(0)
    }).required().options({abortEarly: false});
    
    const validationResult = Joi.validate(req.body, requestSchema);
    
    if (validationResult.error) {
        validationResult.error.details.forEach(err => logger.error(err.message));
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid fetch blog-posts request');
    this.db.query.blog.get(req.body)
        .then((result) => {
            res.json(result);
        });
}

function handleFetchBlogPost(req, res) {
    const idSchema         = Joi.string().alphanum().length(24).required();
    const validationResult = Joi.validate(req.params.id, idSchema);
    
    if (validationResult.error) {
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid fetch blog-post request');
    this.db.query.blog.getById(req.params.id)
        .then((result) => {
            res.json(result);
        }).catch(err => {
        res.sendStatus(404);
    });
}

function handleCreateBlogPost(req, res) {
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
    
    if (validationResult.error) {
        validationResult.error.details.forEach(err => logger.error(err.message));
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid blog-post creation request');
    this.db.query.blog.add(req.body)
        .then((blogPost) => {
            return res.json(blogPost);
        });
}

function handleUpdateBlogPost(req, res) {
    const idSchema      = Joi.string().alphanum().length(24).required();
    const requestSchema = Joi.object().keys({
        author: Joi.object().keys({
            id   : Joi.string(),
            name : Joi.string(),
            email: Joi.string().email()
        }),
        title : Joi.string().min(10).max(300),
        body  : Joi.string().min(20)
    }).required().options({abortEarly: false});
    
    const idValidationResult   = Joi.validate(req.params.id, idSchema);
    const bodyValidationResult = Joi.validate(req.body, requestSchema);
    
    if (idValidationResult.error || bodyValidationResult.error) {
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid update blog-post request');
    this.db.query.blog.update(req.params.id, req.body)
        .then((result) => {
            res.json(result);
        });
}

function handleDeleteBlogPost(req, res) {
    const idSchema         = Joi.string().alphanum().length(24).required();
    const validationResult = Joi.validate(req.params.id, idSchema);
    
    if (validationResult.error) {
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid delete blog-post request');
    this.db.query.blog.remove(req.params.id)
        .then((result) => {
            res.json(result);
        })
        .catch(err => console.log(err));
}
