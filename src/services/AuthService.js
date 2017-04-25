'use strict';

const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');
const bcrypt     = require('bcrypt');

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
        this.db     = server.db.mongo;
        
        this.router.post('/api/login', handleLogin.bind(this));
        this.router.post('/api/loginByToken', handleLoginByToken.bind(this));
        this.router.post('/api/registration', handleRegistration.bind(this));
        this.router.get('/api/logout',
            expressJwt({secret: server.config.secret, isRevoked: isRevokedCallback}),
            handleLogout.bind(this));
    }
};

function handleLogin(req, res) {
    const requestSchema = Joi.object().keys({
        name    : Joi.string().required(),
        password: Joi.string().required()
    }).required();
    
    const validationResult = Joi.validate(req.body, requestSchema);
    
    if (!!validationResult.error) {
        validationResult.error.details.forEach(err => logger.error(err.message));
        return res.status(400).send('invalid parameters');
    }
    
    const {name, password} = req.body;
    
    this.db.query.user.findByName(name)
        .then(user => {
            if (user === null) {
                logger.debug(`Ip ${req.ip} failed login for non-existing user ${name}`);
                return res.status(400).send('invalid credentials');
            }
            
            bcrypt.compare(password, user.password_hash).then(isValid => {
                if (isValid) {
                    const payload = {
                        id   : user._id,
                        name : user.name,
                        email: user.email
                    };
                    return res.json({token: jwt.sign(payload, this.server.config.secret)});
                }
                else {
                    logger.warn(`Ip ${req.ip} failed login for user ${name}`);
                    return res.status(400).send('invalid credentials');
                }
            });
        });
}

function handleLoginByToken(req, res) {
    try {
        jwt.verify(req.body.token, this.server.config.secret);
        return res.json({token: req.body.token});
    } catch (err) {
        logger.error('Invalid Token: ', err.message);
        return res.status(400).json({error: 'invalid token'});
    }
}

function handleLogout(req, res) {
    revokedTokens.push(req.token);
    res.sendStatus(200);
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
        return res.status(400).send('invalid parameters')
    }
    if (req.body.password !== req.body.password_check) {
        return res.status(400).send('passwords do not match')
    }
    
    logger.debug('received valid registration request');
    this.db.query.user.findByNameOrEmail(req.body.name, req.body.email)
        .then(foundUser => {
                if (foundUser === null) {
                    this.db.query.user.create(req.body)
                        .then(user => {
                            return res.json({
                                id       : user._id,
                                name     : user.name,
                                email    : user.email,
                                createdAt: user.createdAt
                            });
                        })
                        .catch(err => {
                            logger.error('error creating user:', err);
                            return res.sendStatus(500);
                        });
                } else {
                    const msg = 'Name or Email already registered.';
                    logger.error(msg);
                    return res.sendStatus(400);
                }
            }
        );
}
