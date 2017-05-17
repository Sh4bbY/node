'use strict';

const Joi        = require('joi');
const expressJwt = require('express-jwt');
const logger     = require('log4js').getLogger('server');

module.exports = class FeedbackService {
    constructor(server) {
        this.server = server;
        this.router = server.router;
        this.db     = server.db.mongo;
        
        const protectMiddleware = expressJwt({secret: this.server.config.jwtSecret});
        
        this.router.post('/api/feedback', handleCreateFeedback.bind(this));
        this.router.get('/api/feedback', protectMiddleware, handleGetFeedback.bind(this));
        this.router.get('/api/feedback/:id', protectMiddleware, handleGetFeedbackById.bind(this));
        this.router.delete('/api/feedback/:id', protectMiddleware, handleDeleteFeedback.bind(this));
    }
};

function handleGetFeedback(req, res) {
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
    
    logger.debug('received valid get feedback request');
    this.db.query.feedback.get(options).then((feedback) => res.json(feedback));
}

function handleGetFeedbackById(req, res) {
    const idSchema   = Joi.string().alphanum().length(24).required();
    const validation = Joi.validate(req.params.id, idSchema);
    
    if (validation.error) {
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid get feedback request');
    this.db.query.feedback.getById(req.params.id)
        .then((result) => res.json(result))
        .catch(err => res.sendStatus(404));
}

function handleCreateFeedback(req, res) {
    const requestSchema = Joi.object().keys({
        author : Joi.string().min(4).required(),
        email  : Joi.string().email().required(),
        type   : Joi.string().required(),
        topic  : Joi.string().min(10).max(300).required(),
        message: Joi.string().min(20).required()
    }).required().options({abortEarly: false});
    
    const validation = Joi.validate(req.body, requestSchema);
    
    if (validation.error) {
        validation.error.details.forEach(err => logger.error(err.message));
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid feedback creation request');
    this.db.query.feedback.add(req.body)
        .then((blogPost) => res.json(blogPost));
}
function handleDeleteFeedback(req, res) {
    const idSchema   = Joi.string().alphanum().length(24).required();
    const validation = Joi.validate(req.params.id, idSchema);
    
    if (validation.error) {
        return res.status(400).send('Invalid Parameters');
    }
    
    logger.debug('received valid delete feedback request');
    this.db.query.feedback.removeById(req.params.id)
        .then((result) => res.json(result))
        .catch(err => console.log(err));
}
