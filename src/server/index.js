const { Server } = require('net');
const os = require('os');

class TCPServer extends Server {
    constructor(port) {
        super();
        this.port = port || 12345;

        this.startSever();
    }

    startSever() {
        const serverIp = this.getServerIp();
        this.createServerSocket(serverIp, this.port);
        this.processRequest();
    }

    getServerIp() {
        const interfaces = os.networkInterfaces();
        for (let devName in interfaces) {
            const iface = interfaces[devName];

            for (let i = 0; i < iface.length; i++) {
                let alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }
        return '0.0.0.0';
    }

    createServerSocket(serverIP, port) {
        super.maxConnections = 1;
        super.listen(port, serverIP, () => {
            console.info(
                `Server listening 🚀 for connection requests on socket port:${port} and address: ${serverIP}`
            );
        });
    }

    processRequest() {
        super.on('connection', (socket) => {
            socket.setEncoding('utf-8');
            socket.setTimeout(1000);

            socket.on('data', (chunk) => {
                // Here we have the data from the client
                const messageParts = chunk.split('\n');
                if (messageParts.length != 3) throw new Error('Invalid message format')
                if (!messageParts[1].toUpperCase().trim().includes('MACHINE:')) throw new Error('Invalid message format');
                const machineParts = messageParts[1].split(':');
                if (machineParts.length != 2) throw new Error('Invalid message format');

                const machine = machineParts[1].trim().toUpperCase();
                if (!messageParts[2].toUpperCase().trim().includes('DATA:')) throw new Error('Invalid message format');

                const data = messageParts[2].substring(6);
                const dataReceived = `when: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}, machine: ${machine}, data: ${data}`;

                console.log(`Data received from client:\n\n${dataReceived}`);
                socket.end();
            });
            // Response to the client

            socket.write('Success!');

            socket.on('error', (err) => {
                console.log(err);
            });
        });
    }
}

module.exports = TCPServer;