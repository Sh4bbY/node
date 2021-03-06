'use strict';

const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const marked     = require('marked');
const logger     = require('log4js').getLogger('server');

module.exports = class BlogService {
    constructor(server) {
        this.server = server;
        this.router = server.router;
        this.db     = server.db.mongo;
        
        const protectMiddleware = expressJwt({secret: this.server.config.jwtSecret});
        
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
    const validation    = Joi.validate(req.query, requestSchema);
    
    if (validation.error) {
        validation.error.details.forEach(err => logger.error(err.message));
        return res.status(400).send('Invalid Parameters');
    }
    
    const options = {};
    Object.keys(req.query).forEach(key => options[key] = parseInt(req.query[key]));
    
    logger.debug('received valid fetch blog-posts request');
    this.db.query.blog.get(options).then((posts) => {
        posts.forEach(post => post.body = marked(post.body));
        res.json(posts);
    });
}

function handleFetchBlogPost(req, res) {
    const idSchema   = Joi.string().alphanum().length(24).required();
    const validation = Joi.validate(req.params.id, idSchema);
    
    if (validation.error) {
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
    
    const validation = Joi.validate(req.body, requestSchema);
    
    if (validation.error) {
        validation.error.details.forEach(err => logger.error(err.message));
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid blog-post creation request');
    this.db.query.blog.add(req.body)
        .then((blogPost) => {
            return res.json(blogPost);
        });
}

function handleUpdateBlogPost(req, res) {
    const schema = Joi.object().keys({
        id  : Joi.string().alphanum().length(24).required(),
        body: Joi.object().keys({
            author: Joi.object().keys({
                id   : Joi.string(),
                name : Joi.string(),
                email: Joi.string().email()
            }),
            title : Joi.string().min(10).max(300),
            body  : Joi.string().min(20)
        })
    }).required().options({abortEarly: false});
    
    const validation = Joi.validate({id: req.params.id, body: req.body}, schema);
    
    if (validation.error) {
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid update blog-post request');
    this.db.query.blog.update(req.params.id, req.body)
        .then((result) => {
            res.json(result);
        });
}

function handleDeleteBlogPost(req, res) {
    const idSchema   = Joi.string().alphanum().length(24).required();
    const validation = Joi.validate(req.params.id, idSchema);
    
    if (validation.error) {
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid delete blog-post request');
    this.db.query.blog.removeById(req.params.id)
        .then((result) => {
            res.json(result);
        })
        .catch(err => console.log(err));
}
