const fs = require('fs');
const path = require('path');

function checkCOW(sourceFile, destinationFile) {
    const sourceStat = fs.statSync(sourceFile);
    const destinationStat = fs.statSync(destinationFile);

    return sourceStat.ino === destinationStat.ino;
}

// const sourceFile = '/Volumes/isolation/exp-datas/json_files/data_1.json';
const sourceFile = path.join(__dirname, 'json_files', 'data_1.json');
const destinationFile = path.join(__dirname, 'data_1.json');

fs.copyFile(sourceFile, destinationFile, (err) => {
    if (err) {
        console.error('Error copying file:', err);
        return;
    }

    if (checkCOW(sourceFile, destinationFile)) {
        console.log('Copy-on-write is used.');
    } else {
        console.log('Copy-on-write is not used.');
    }
});
