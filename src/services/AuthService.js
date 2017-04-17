'use strict';

const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');
const Database   = require('../common/Database');
const bcrypt     = require('bcrypt');

module.exports = class SecurityService {
    constructor(server) {
        this.server = server;
        this.router = this.server.router;
        this.db     = new Database();
        this.db.connect();
        this.router.post('/api/login', SecurityService._handleLogin.bind(this));
        this.router.post('/api/loginByToken', SecurityService._handleLoginByToken.bind(this));
        this.router.post('/api/registration', SecurityService._handleRegistration.bind(this));
        this.router.get('/api/protected', expressJwt({secret: this.server.config.secret}), (req, res) => res.send('PSST!'));
    }
    
    static _handleLoginByToken(req, res) {
        try {
            jwt.verify(req.body.token, this.server.config.secret);
            return res.json({token: req.body.token});
        } catch (err) {
            logger.error('Invalid Token: ', err.message);
            return res.status(401).json({error: 'invalid token'});
        }
        
    }
    
    static _handleLogin(req, res) {
        const requestSchema = Joi.object().keys({
            email   : Joi.string().required(),
            password: Joi.string().required()
        }).required().options({abortEarly: false});
        
        const validationResult = Joi.validate(req.body, requestSchema);
        
        if (!!validationResult.error) {
            validationResult.error.details.forEach(err => logger.error(err.message));
            throw new Error('Invalid Parameters', validationResult.error);
        }
        
        this.db.findUserByEmail(req.body.email)
            .then(user => {
                if (user === null) {
                    logger.warn(`Ip ${req.ip} tried to login into non-existing account ${req.body.email}`);
                    return res.status(401).json({error: 'invalid credentials'});
                }
                
                bcrypt.compare(req.body.password, user.password).then(isValid => {
                    if (isValid) {
                        const payload = {
                            name : user.name,
                            email: user.email
                        };
                        res.json({token: jwt.sign(payload, this.server.config.secret)});
                    }
                    else{
                        logger.warn(`Ip ${req.ip} failed login for account ${req.body.email}`);
                        return res.status(401).json({error: 'invalid credentials'});
                    }
                });
            });
    }
    
    static _handleRegistration(req, res) {
        const result = {
            username: 'Shabby',
            email   : 'Shabby@asd',
            token   : 'agafgdfgfdgfdgd'
        };
        res.json(result);
    }
};
