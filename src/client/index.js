const net = require('net');
const host = process.argv[2] || '192.168.1.2';
const port = process.argv[3] || 12345;
const message = process.argv[4] || 'Hello TCP World!';
const client = new net.Socket();

client.connect(port, host, function () {
	console.log('TCP connection established with the server.');
	client.write(`${message} from ${client.address().address}`);
});

client.on('data', function (chunk) {
	console.log(`Data received from the server: ${chunk.toString()}.`);
	client.end();
});

client.on('end', function () {
	console.log('Requested an end to the TCP connection');
});

client.on('error', (error) => {
	console.log(`Error ${error} ${host}:${port}`);
});

