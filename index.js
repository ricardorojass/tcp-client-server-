  
const TCPServer = require('./src/server');
const { PORT } = require('./src/config');

const server = new TCPServer(PORT);