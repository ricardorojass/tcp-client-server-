const net = require('net');
const areThereThreeArgs = process.argv.length === 5;
const host = areThereThreeArgs ? process.argv[2] : '192.168.1.2';
const port = areThereThreeArgs ? process.argv[3] : 12345;
const messageToSend = areThereThreeArgs ? process.argv[4] : 'LOG\nMACHINE: M001-A3\nDATA: { Temperatura: 15, Humedad: 10, ProbabilidadLluvia: 30 }';


const client = new net.Socket();

client.connect(port, host, function () {
	console.log('TCP connection established with the server.');
	client.write(messageToSend);
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

