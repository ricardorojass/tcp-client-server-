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
		
    const serverSocket = this.createServerSocket(serverIp, this.port);
    
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
		super.listen(port, serverIP, () => {
      console.info(
        `Server listening 🚀 for connection requests on socket port:${port} and address: ${serverIP}`
      );
    });

    super.on('connection', (socket) => {
      socket.setEncoding('utf-8');
      socket.setTimeout(1000);

      socket.on('data', (chunk) => {
        // Here we have the data from the client
        console.log(`Data received from client: ${chunk}`);
        socket.end();
      });
      // Response to the client
      socket.write('We got ya!');

      socket.on('error', (err) => {
        console.log(`Error: ${err}`);
      });
    });
	}
}

module.exports = TCPServer;