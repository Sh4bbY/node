'use strict';

const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');
const Database   = require('../common/Database');
const bcrypt     = require('bcrypt');
const fs         = require('fs');
const path       = require('path');

// Todo Move to File/Db:
const revokedTokens = [];

function isRevokedCallback(req, payload, done) {
    const issuer  = payload.iss;
    const tokenId = payload.jti;
    
    const isRevoked = revokedTokens.indexOf(req.token) !== -1;
    return done(null, isRevoked);
}

module.exports = class AuthService {
    constructor(server) {
        this.server = server;
        this.router = server.router;
        this.db     = new Database();
        this.db.connect();
        this.router.post('/api/login', handleLogin.bind(this));
        this.router.post('/api/loginByToken', handleLoginByToken.bind(this));
        this.router.post('/api/registration', handleRegistration.bind(this));
        this.router.get('/api/logout',
            expressJwt({secret: server.config.secret, isRevoked: isRevokedCallback}),
            handleLogout.bind(this));
    }
};


function handleLoginByToken(req, res) {
    try {
        jwt.verify(req.body.token, this.server.config.secret);
        return res.json({token: req.body.token});
    } catch (err) {
        logger.error('Invalid Token: ', err.message);
        return res.status(401).json({error: 'invalid token'});
    }
}

function handleLogout(req, res) {
    try {
        jwt.verify(req.token, this.server.config.secret);
        revokedTokens.push(req.token);
        res.send('');
    } catch (err) {
        logger.error('Invalid Token: ', err.message);
        return res.status(401).send('invalid token');
    }
}

function handleLogin(req, res) {
    const requestSchema = Joi.object().keys({
        name    : Joi.string().required(),
        password: Joi.string().required()
    }).required();
    
    const validationResult = Joi.validate(req.body, requestSchema);
    
    if (!!validationResult.error) {
        validationResult.error.details.forEach(err => logger.error(err.message));
        return res.status(403).send('invalid credentials');
    }
    
    const {name, password} = req.body;
    
    this.db.findUserByName(name)
        .then(user => {
            if (user === null) {
                logger.debug(`Ip ${req.ip} failed login for non-existing user ${name}`);
                return res.status(403).send('invalid credentials');
            }
            
            bcrypt.compare(password, user.password_hash).then(isValid => {
                if (isValid) {
                    const payload = {
                        id   : user._id,
                        name : user.name,
                        email: user.email
                    };
                    res.json({token: jwt.sign(payload, this.server.config.secret)});
                }
                else {
                    logger.warn(`Ip ${req.ip} failed login for user ${name}`);
                    return res.status(403).send('invalid credentials');
                }
            });
        });
}

function handleRegistration(req, res) {
    const requestSchema = Joi.object().keys({
        name          : Joi.string().min(3).max(15).required(),
        email         : Joi.string().email().required(),
        password      : Joi.string().min(6).required(),
        password_check: Joi.string().min(6).required()
    }).required().options({abortEarly: false});
    
    const validationResult = Joi.validate(req.body, requestSchema);
    
    if (!!validationResult.error) {
        validationResult.error.details.forEach(err => logger.error(err.message));
        throw new Error('Invalid Parameters', validationResult.error);
    }
    if (req.body.password !== req.body.password_check) {
        throw new Error('Invalid Parameters');
    }
    
    logger.debug('received valid registration request');
    this.db.findUserByNameOrEmail(req.body.name, req.body.email)
        .then(foundUser => {
                if (foundUser === null) {
                    this.db.createUser(req.body)
                        .then(user => {
                            res.json({
                                id       : user._id,
                                name     : user.name,
                                email    : user.email,
                                createdAt: user.createdAt
                            });
                        })
                        .catch(err => {
                            logger.error('error creating user:', err);
                            res.sendStatus(500);
                        });
                } else {
                    const msg = 'Name or Email already registered.';
                    logger.error(msg);
                    res.sendStatus(422);
                }
            }
        );
}
