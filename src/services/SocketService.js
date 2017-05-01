'use strict';

const io     = require('socket.io');
const logger = require('log4js').getLogger('server');

module.exports = class SocketService {
    constructor(server) {
        this.server  = server;
        this.router  = server.router;
        this.sockets = [];
        
        this.server.onConnection(onConnection.bind(this));
    }
};

function onConnection() {
    this.io  = io(this.server.server, {path: '/api/chat'});
    this.nsp = this.io.of('/api/chat');
    this.nsp.on('connection', (socket) => {
        logger.debug('new client connected to socket namespace /api/chat');
        this.sockets.push(socket);
        
        socket.on('chat-message', (msg) => {
            this.sockets.forEach(socket => socket.send({data: msg}));
        });
    });
}
