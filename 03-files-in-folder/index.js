const fs = require('fs/promises');
const path = require('path');
const { stdout, exit } = process;


stdout.write('\nФайлы папки \'\\secret-folder\':\n\n');

const wayDirect = path.dirname(__filename) + '\\secret-folder';

const files = fs.readdir(wayDirect, {withFileTypes: true});

files.then((value) => {

    stdout.write('file-name\ttype\tsize\n......\n');

    for (let val of value){
        if (val.isFile()){

            let fileData = fs.stat(wayDirect +'\\'+val.name);
            let fileExt = path.extname(val.name);
            let fileName = val.name.slice(0, val.name.length - fileExt.length);

            fileData.then((data) => {
                let fileSize = data.size;
                stdout.write(`${fileName}\t\t${fileExt}\t${fileSize/1000} Kb\n`);
            })
        }
    }
});

process.on('exit', () => stdout.write('\nПрограмма завершена.\n\n'));
process.on('error', error => console.log('Error', error.message));
process.on('SIGINT', () => exit());