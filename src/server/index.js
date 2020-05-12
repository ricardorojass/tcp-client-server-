const { Server } = require('net');
const os = require('os');
const fs = require('fs');
const fastCSV = require('fast-csv');
const LogEntry = require('./logEntry');

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

            socket.on('data', (chunk) => {
                // Here we have the data from the client
                const responseMessage = this.processMessageFromClient(chunk);

                console.log(`Data received from client: ${responseMessage}`);
                socket.end();
            });
            // Response to the client

            socket.write('Success!');

            socket.on('error', (err) => {
                console.log(err);
            });
        });
    }

    processMessageFromClient(message) {
        const notCompliantWithYWPError = "No cumple con el protocolo YWP";
        if (message.length === 0) return notCompliantWithYWPError;

        if (message.includes('GET')) return this.processGet(message);
        if (message.includes('LOG')) {
            let error;
            error = this.processLog(message);
            // if (error.length !== 0) {
            //     return error;
            // }
            return 'Log entry saved';
        }
        return notCompliantWithYWPError;
    }

    async processLog(message) {
        let log;
        try {
            log = await LogEntry(message);
            await this.saveCSVFile(log);
            return null;
        } catch (error) {
            return error;
        }
    }

    processGet(message) {
        return  'GET entry saved from Function'
    }

    saveCSVFile(message) {
        const csvStream = fastCSV.format({ headers: true });
        const ws = fs.createWriteStream('log.csv');

        csvStream.pipe(ws);

        csvStream.write(message);
        csvStream.end();
    }
}

module.exports = TCPServer;