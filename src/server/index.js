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
        super.on('connection', async (socket) => {
            socket.setEncoding('utf-8');
            let responseMessage;
            socket.on('data', async (chunk) => {
                // Here we have the data from the client
                responseMessage = await this.processMessageFromClient(chunk);
                console.log(responseMessage);

                // Respond to client
                if (!responseMessage) {
                    socket.write('Upps!!! something wrong happened');
                } else {
                    socket.write(responseMessage.toString());
                }
                socket.end();
            });

            socket.on('error', (err) => {
                console.log(err);
            });
        });
    }

    async processMessageFromClient(message) {
        const notCompliantWithYWPError = 'No cumple con el protocolo YWP';
        if (message.length === 0) return notCompliantWithYWPError;

        if (message.includes('GET')) return await this.processGet(message);
        if (message.includes('LOG')) {
            let error;
            error = await this.processLog(message);
            if (error && error.length !== 0) {
                return error;
            }
            return 'Log entry saved';
        }
        return notCompliantWithYWPError;
    }

    async processLog(message) {
        let log;
        try {
            log = await LogEntry(message);
            const csvStream = fastCSV.format({ writeHeaders: false, delimiter: '\t' });
            const ws = fs.createWriteStream('log.csv', { flags: 'a',  });
            csvStream.pipe(ws);
            csvStream.write(log);
            csvStream.write(',');
            csvStream.end();
            return null;
        } catch (error) {
            return error;
        }
    }

    async processGet(message) {
        const machineRequested = this.getMachineInRequest(message);
        let existingRecords = [];
        const readStream = fs.createReadStream('log.csv', { encoding: 'utf8', highWaterMark: 1024 });
        for await (const chunk of readStream) {
            existingRecords = chunk.split('\n');
        }
        let result = '';
        const normalizeRecords = existingRecords.map((value) => value.split('\t').filter((el) => el.length > 0));
        result = normalizeRecords.filter((el) => el[0] === machineRequested);
        if (result[0] && result[0].length > 0) return result[0];
        return null
    }

    getMachineInRequest(message) {
        const requestParts = message.split(' ');

        if (requestParts.length == 2 && requestParts[1].trim().toUpperCase().includes("FILTERED:")) {
            const filteredParts = requestParts[1].split(':');
            if (filteredParts.length == 2) return filteredParts[1].toUpperCase().trim();
            return null;
        }
        return null;
    }
}

module.exports = TCPServer;