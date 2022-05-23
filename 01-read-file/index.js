const fs = require('fs');
const path = require('path');
const { stdin, stdout, exit, argv } = process;

const readableStream = fs.createReadStream(path.dirname(__filename) + '/text.txt', 'utf-8');
let data = '';

readableStream.on('data', chunk =>stdout.write(data += chunk));
readableStream.on('error', error => console.log('Error', error.message));