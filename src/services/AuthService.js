'use strict';

const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');
const bcrypt     = require('bcrypt');


module.exports = class AuthService {
    constructor(server) {
        this.server = server;
        this.router = server.router;
        this.db     = server.db.mongo;
        
        this.router.post('/api/login', handleLogin.bind(this));
        this.router.post('/api/loginByToken', handleLoginByToken.bind(this));
        this.router.post('/api/registration', handleRegistration.bind(this));
        this.router.get('/api/logout',
            expressJwt({secret: server.config.secret, isRevoked: isRevokedCallback.bind(this)}),
            handleLogout.bind(this));
    }
    
    createTokenResponse(payload) {
        return {
            token: jwt.sign(payload, this.server.config.secret, {expiresIn: '7d'})
        };
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
    
    this.db.query.user.getByName(name)
        .then(user => {
            bcrypt.compare(password, user.password_hash).then(isValid => {
                if (isValid) {
                    const payload = {
                        id   : user._id,
                        name : user.name,
                        email: user.email
                    };
                    return res.json(this.createTokenResponse(payload));
                }
                else {
                    logger.warn(`Ip ${req.ip} failed login for user ${name}`);
                    return res.status(400).send('invalid credentials');
                }
            });
        })
        .catch(() => {
            logger.debug(`Ip ${req.ip} failed login for non-existing user ${name}`);
            return res.status(400).send('invalid credentials');
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
    const payload = jwt.decode(req.token, this.server.config.secret);
    
    removeExpiredTokens.call(this)
        .then(this.db.query.revoked.add({token: req.token, exp: payload.exp}))
        .then(() => {
            res.sendStatus(200);
        });
}

function handleRegistration(req, res) {
    const requestSchema = Joi.object().keys({
        name          : Joi.string().min(3).max(15).required(),
        email         : Joi.string().email().required(),
        password      : Joi.string().min(6).required(),
        password_confirm: Joi.string().min(6).required()
    }).required().options({abortEarly: false});
    
    const validationResult = Joi.validate(req.body, requestSchema);
    
    if (!!validationResult.error) {
        validationResult.error.details.forEach(err => logger.error(err.message));
        return res.status(400).send('invalid parameters')
    }
    if (req.body.password !== req.body.password_confirm) {
        return res.status(400).send('passwords do not match')
    }
    
    logger.debug('received valid registration request');
    this.db.query.user.containsNameOrEmail(req.body.name, req.body.email).then(isContained => {
            if (!isContained) {
                this.db.query.user.create(req.body).then(user => {
                    const payload = {
                        id   : user._id,
                        name : user.name,
                        email: user.email
                    };
                    return res.json(this.createTokenResponse(payload));
                }).catch(err => {
                    logger.error('error creating user:', err);
                    return res.sendStatus(500);
                });
            }
            else {
                const msg = 'Name or Email already registered.';
                logger.error(msg);
                return res.sendStatus(406);
            }
        }
    );
}

function isRevokedCallback(req, payload, done) {
    this.db.query.revoked.contains({token: req.token})
        .then(isRevoked => done(null, isRevoked));
}


function removeExpiredTokens() {
    const now = Math.floor(Date.now() / 1000);
    return this.db.query.revoked.remove({exp: {$lt: now}});
}

