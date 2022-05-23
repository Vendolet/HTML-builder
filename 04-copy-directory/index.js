const fs = require('fs/promises');
const path = require('path');
const { stdout, exit, stdin } = process;

const srcFolder = 'files';
const destFolder = 'files-copy';
const rootDirect = path.dirname(__filename);

stdout.write('\nВыполняется создание копии папки \'\\files\' c файлами в папке \'\\files-copy\'\n');

function copyDir(root, source, dest){
    const newDirect = fs.mkdir(`${root}\\${dest}`, {recursive: true});
    const filesSrc = fs.readdir(`${root}\\${source}`); //файлы источника

    newDirect.then((newDirect) => {
        if (newDirect){
            stdout.write('\nСоздана папка \'\\files-copy\'\n');

            filesSrc.then((FileOrigin) => {
                for (valFile of FileOrigin){
                    fs.copyFile(`${root}\\${source}\\${valFile}`, `${newDirect}\\${valFile}`);
                    stdout.write(`\nФайл записан: ${valFile}`);
                }
            })
        }else{
            newDirect = `${root}\\${dest}`;
            
            const filesDest = fs.readdir(`${root}\\${dest}`); //файлы новой директории

            filesSrc.then((filesSrcVal) => {
                filesDest.then((filesDestVal) => {

                    for (file of filesDestVal){
                        let fileDestData = fs.stat(`${newDirect}\\${file}`); //данные по файлу новой директории

                        if (filesSrcVal.includes(file)){
                            let fileSrcData = fs.stat(`${root}\\${source}\\${file}`); //данные по оригинальному файлу

                            let fileName = file; // переменная для работы в скоупе файлов file...Data

                            fileDestData.then((fileDestDataVal) => {
                                fileSrcData.then((fileSrcDataVal) => {

                                    if (fileDestDataVal.mtimeMs !== fileSrcDataVal.mtimeMs){
                                        fs.copyFile(`${root}\\${source}\\${fileName}`, `${newDirect}\\${fileName}`);
                                        stdout.write(`\nФайл перезаписан: ${fileName}`);
                                    }
                                })
                            })
                        }else{
                            fs.rm(`${newDirect}\\${file}`);
                            stdout.write(`\nФайл удалён: ${file}`);
                        }
                    }

                    for (file of filesSrcVal){

                        if (!filesDestVal.includes(file)){
                            fs.copyFile(`${root}\\${source}\\${file}`, `${newDirect}\\${file}`);
                            stdout.write(`\nФайл записан: ${file}`);
                        }
                    }
                })
            })
        }
    })
}

process.on('exit', () => stdout.write('\nКопирование завершено.\n\n'));
process.on('error', error => console.log('Error', error.message));

copyDir(rootDirect, srcFolder, destFolder);