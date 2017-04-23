'use strict';

const mongoose   = require('mongoose');
mongoose.Promise = Promise;
const bcrypt     = require('bcrypt');
const logger     = require('log4js').getLogger('server');
const saltRounds = 10;

const userSchema     = new mongoose.Schema({
    name         : String,
    password_hash: String,
    email        : String,
    createdAt    : Date
});
const BlogPostSchema = new mongoose.Schema({
    author   : {
        name : String,
        email: String,
        id   : String
    },
    title    : String,
    body     : String,
    createdAt: Date
});
const UserModel      = mongoose.model('test', userSchema);
const BlogPostModel  = mongoose.model('BlogPost', BlogPostSchema);

module.exports = class Database {
    connect() {
        if (!mongoose.connection.readyState) {
            return mongoose.connect('mongodb://localhost/test');
        }
    }
    
    disconnect() {
        mongoose.connection.close();
    }
    
    cleanUp() {
        UserModel.collection.drop();
    }
    
    findUserByName(name) {
        return UserModel.findOne({name: {$regex: new RegExp(name, 'i')}});
    }
    
    findUserByNameOrEmail(name, email) {
        return UserModel.findOne({
            $or: [
                {name: {$regex: new RegExp(name, 'i')}},
                {email: {$regex: new RegExp(email, 'i')}}
            ]
        });
    }
    
    createUser(user) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(user.password, saltRounds).then(hash => {
                const dataRecord = {
                    name         : user.name,
                    password_hash: hash,
                    email        : user.email.toLowerCase(),
                    createdAt    : Date.now()
                };
                const userModel  = new UserModel(dataRecord);
                userModel.save((err, savedUser) => {
                    if (err) {
                        reject(err);
                    } else {
                        logger.info(`user ${savedUser.name} created`);
                        resolve(savedUser);
                    }
                });
            });
        });
    }
    
    createBlogPost(blogPostData) {
        return new Promise((resolve, reject) => {
            const storageData = {
                author   : {
                    name : blogPostData.author.name,
                    email: blogPostData.author.email,
                    id   : blogPostData.author.id
                },
                title    : blogPostData.title,
                body     : blogPostData.body,
                createdAt: Date.now()
            };
            
            const newPost = new BlogPostModel(storageData);
            newPost.save((err, savedPost) => {
                if (err) {
                    reject(err);
                } else {
                    logger.info('blog-post created');
                    resolve(savedPost);
                }
            });
        });
    }
    
    fetchBlogPosts(data) {
        return new Promise((resolve, reject) => {
            BlogPostModel
                .find({})
                .sort({createdAt: 'desc'})
                .exec((err, docs) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(docs);
                });
        });
    }
};
