const fs = require('fs');
const fsP = require('fs/promises');
const path = require('path');
const { stdout, exit } = process;

stdout.write('\nЗапуск программы объединения файлов стилей.\n');

function createBundle(){
    const filesStyles = fsP.readdir(path.dirname(__filename)+ '\\styles', {withFileTypes: true});

    filesStyles.then((filesSt) => {
    
        const outToFile = fs.createWriteStream(path.dirname(__filename)+'\\project-dist'+'\\bundle.css');
    
        for (file of filesSt){

            if (file.isFile() && path.extname(file.name) === '.css'){
                const inputRead = fs.createReadStream(`${path.dirname(__filename)}\\styles\\${file.name}`, 'utf-8');
                inputRead.on('data', chunk => outToFile.write(chunk));
            }
        }
    })
}

createBundle();

process.on('exit', () => stdout.write('\nЗапись завершена.\n\n'));