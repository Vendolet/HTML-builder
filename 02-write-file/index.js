const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { stdin, stdout, exit } = process;

stdout.write('\nВведите текст для записи.\n*Для завешения программы введите \'exit\'.\n.......\n');

const output = fs.createWriteStream(path.dirname(__filename) + '/text.txt');

stdin.on('data', data => {

    let strData = data.toString().slice(0, data.length - 2);

    if (strData == 'exit'){
        exit();
    } else{
        output.write(`${strData}\n`);
    }
});

process.on('exit', () => stdout.write('\nПрограмма завершена.\n\n'));
process.on('error', error => console.log('Error', error.message));
process.on('SIGINT', () => exit());