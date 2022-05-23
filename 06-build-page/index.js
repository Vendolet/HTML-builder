const fsP = require('fs/promises');
const fs = require('fs');
const path = require('path');

const { error } = require('console');
const { constants } = require('buffer');
const { stdout } = process;

stdout.write('\nЗапущена программа сборки проекта.\n\n');

//* Сборка файла HTML -----------------------------------------------------------------------------------------------

function createHTML(directProject){
    // считывание данных с каталога components

    const readFilesComponents = fsP.readdir(path.dirname(__filename) + '\\components');

    // копирование файла template.html в папку проекта с заменой наименования на index.html
    const copyHTML = fsP.copyFile(path.dirname(__filename) + '\\template.html', directProject + '\\index.html');

    copyHTML.then( () => {
        const DirectIndexTemp = directProject + '\\index.html';
        // Чтение содержимого index.html
        const readIndexTemp = fsP.readFile(DirectIndexTemp, {encoding: 'utf-8'});

        readIndexTemp.then((dataIndexTemp) => {

            let newDataIndex = dataIndexTemp;
            const writeIndexHTML = fs.createWriteStream(directProject + '\\index.html');

            readFilesComponents.then((filesComponents) => {
                for (let i = 0; i < filesComponents.length; i++){

                    let fileCmp = filesComponents[i];

                    // Чтение содержимого файлов components
                    let readFileCmp = fsP.readFile(`${path.dirname(__filename)}\\components\\${fileCmp}`);
                    readFileCmp.then((dataFileCmp) => {

                        let extFileCmp = path.extname(fileCmp);
                        let nameFileCmp = fileCmp.slice(0, -extFileCmp.length);
                        let regExp = new RegExp(`{{${nameFileCmp}}}`, 'g');

                        // замена кодовых слов на содержимое файлов во временном файле indexTemp.html
                        newDataIndex = newDataIndex.replace(regExp, dataFileCmp);

                        if (i === filesComponents.length - 1){
                            writeIndexHTML.write(newDataIndex);
                            stdout.write('\n\nВыполнена сборка файла index.html\n');
                        }
                    })
                }
            })
        })
    })
}

//* Объединение стилей проекта в файл -------------------------------------------------------------------------------

function createStyle(directProject){
    const readDirectStyles = fsP.readdir(path.dirname(__filename) + '\\styles', {withFileTypes: true});
                
    readDirectStyles.then((filesStyles) => {
        const writeStyles = fs.createWriteStream(directProject + '\\style.css');

        for (file of filesStyles){

            if (path.extname(file.name) === '.css'){
                const readStyles = fs.createReadStream(`${path.dirname(__filename)}\\styles\\${file.name}`);
                readStyles.on('data', chunk => writeStyles.write(chunk));
                stdout.write(`\nСодержимое файла ${file.name} записано в style.css`);
            }
        }
    })
}

//* Создание копии папки assets ------------------------------------------------------------------------------------

function createAssetsCopy(directProject){
            
    //* Вспомогательные функции -----------------------------------------------------------

    // удаление каталога с файлами: -----------
    function deleteNotEmptyCatalog(directCatalogDel){
        const readFilesCatalogDeleted = fsP.readdir(`${directCatalogDel}`, {withFileTypes: true});

        readFilesCatalogDeleted.then((directCatalogDelete) => {
            for (file of directCatalogDelete){
                let valFile = file;

                if (valFile.isFile()){

                    fs.rm(`${directCatalogDel}\\${valFile.name}`);
                    stdout.write(`\nФайл в папке ${directCatalogDel} удалён: ${valFile}`);
                } else{
                    deleteNotEmptyCatalog(`${directCatalogDel}\\${valFile}`)
                }
            }
        })
    }
        
    // копирование файлов: -----------
        function copyFilesFunction(catalogOrigin, catalogCopy){
            const readDirectAssets = fsP.readdir(`${catalogOrigin}`, {withFileTypes: true});

            readDirectAssets.then((filesAssetsOrigin) => {
                for (file of filesAssetsOrigin){
                    let valFile = file;
                    if (valFile.isFile()){
                        fsP.copyFile(`${catalogOrigin}\\${valFile.name}`, `${catalogCopy}\\${valFile.name}`);
                        // stdout.write(`\nФайл в папку ${catalogCopy} записан: ${valFile.name}`);
                    } else{
                        fs.mkdir(`${catalogCopy}\\${valFile.name}`, {recursive: true}, (err, direct) => {
                            if (err) {throw err}
                            copyFilesFunction(`${catalogOrigin}\\${valFile.name}`, direct);
                        })
                    }
                }
            })
        }

    // обновление файлов: --------------
        function checkFilesFunction(catalogOrigin, catalogCopy){
            
            const readDirectAssets = fsP.readdir(catalogOrigin); // получение файлов и папок директории assets
            const readDirectCopyAssets = fsP.readdir(catalogCopy, {withFileTypes: true}); //получение файлов и папок новой директории assets

            // Проверка на наличие файлов в новой директории
            readDirectAssets.then((filesAssetsOrigin) => {
                readDirectCopyAssets.then((filesAssetsCopy) => {

                    for (file of filesAssetsCopy){
                            
                        let fileName = file.name; // переменная для работы в скоупе файлов file...Data
                        // проверяем, что элемент - это файл
                        if (file.isFile()){
                            let filesAssetsCopyData = fsP.stat(`${catalogCopy}\\${fileName}`); //данные по файлу новой директории
                            // проверка: содеражтся ли файлы из новой директории в оригинальной директории
                            if (filesAssetsOrigin.includes(fileName)){
                                let filesAssetsOriginData = fsP.stat(`${catalogOrigin}\\${fileName}`); //данные по оригинальному файлу

    
                                filesAssetsCopyData.then((filesAssetsCopyDataVal) => {
                                    filesAssetsOriginData.then((filesAssetsOriginDataVal) => {
                                        // проверка на наличие изменений в файлах оригинальной директории
                                        if (filesAssetsCopyDataVal.mtimeMs !== filesAssetsOriginDataVal.mtimeMs){
                                            fs.copyFile(`${catalogOrigin}\\${fileName}`, `${catalogCopy}\\${fileName}`);
                                            stdout.write(`\nФайл в папке ${catalogCopy} перезаписан: ${fileName}`);
                                        }
                                    })
                                })
                            }else{
                                // удаление файлов, если они не содержатся в оригинальной директории
                                fs.rm(`${catalogCopy}\\${fileName}`);
                                stdout.write(`\nФайл в папке ${catalogCopy} удалён: ${fileName}`);
                            }
                        }else{ // если элемент каталог. Проверяется наличие каталога в оригинальной папке
                            if (filesAssetsOrigin.includes(fileName)){
                                //если каталог есть:
                                checkFilesFunction(`${catalogOrigin}\\${fileName}`, `${catalogCopy}\\${fileName}`);
                            }else{ 
                                // если каталог в оригинальной папке отсутсвует:
                                // удаление каталога с файлами
                                deleteNotEmptyCatalog(`${catalogOrigin}\\${fileName}`);
                            }
                        }
                    }
                    // Копирование файлов из оригинальной директории, которых нет в новой
                    // Cоздание массива наименований файлов и директорий новой папки assets
                    let arrFileNameCopy = [];

                    for (let i = 0; i < filesAssetsCopy.length; i++){
                        arrFileNameCopy.push(filesAssetsCopy[i].name);
                    }
                    // поиск отсутсвующих файлов в новой директории по сравнению с оригинальной.
                    for (file of filesAssetsOrigin){
                        let fileName = file;

                        if (!arrFileNameCopy.includes(fileName)){
                            copyFilesFunction(catalogOrigin, catalogCopy);
                        }
                    }
                })
            })
        }

    //* основное действие создания копии папки assets: -------------------------------------------------------------------

    // создание каталога assets: --------------------------------------------
        fs.mkdir(directProject + '\\assets', {recursive: true}, (err, directProjectAssets) => {
            if (err) {
                throw err;
            }else{
            // условие, если проект собирается впервые и папка assets cоздана впервые:

                if (directProjectAssets){
                    stdout.write('\nСоздана папка \'\\assets\'\n');

                // вызываем функцию копирования каталогов и файлов:
                    copyFilesFunction(`${path.dirname(__filename)}\\assets`, directProjectAssets);

            // условие если папка Asses была создана ранее: ----------------
                }else{
                    directProjectAssets = directProject + '\\assets';

                // вызываем функцию обновления каталогов и файлов:
                    checkFilesFunction(`${path.dirname(__filename)}\\assets` ,directProjectAssets);
                }
            }
        })
}

//* Сборка проекта ------------------------------------------------------------------------------------------------
function createProject(){
    //Создаётся директория проекта:
    const createDirectoryProject = fsP.mkdir(path.dirname(__filename)+'\\project-dist', {recursive: true});

    createDirectoryProject.then((directProject) => {
    // Создание каталога вновь
        if (directProject){
            stdout.write(`\nСоздана директория: ${directProject}\n`);
        // Сборка файла HTML -----------------------------------------------------------------------------------------------
            createHTML(directProject);
            
        // Объединение стилей проекта в файл -------------------------------------------------------------------------------
            createStyle(directProject);
            
        // Создание копии папки assets ------------------------------------------------------------------------------------
            createAssetsCopy(directProject);
    // Каталог был создан ранее
        }else{
            const directProject = path.dirname(__filename) + '\\project-dist';
        // Сборка файла HTML -----------------------------------------------------------------------------------------------
            createHTML(directProject);
            
        // Объединение стилей проекта в файл -------------------------------------------------------------------------------
            createStyle(directProject);
            
        // Создание копии папки assets ------------------------------------------------------------------------------------
            createAssetsCopy(directProject);
        }
    })
}

createProject();

process.on('exit', () => stdout.write('\nСборка проекта завершена.\n\n'));
process.on('error', error => console.log('Error', error.message));