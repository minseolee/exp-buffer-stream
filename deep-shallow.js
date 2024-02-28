const fs = require('fs');
const path = require('path');

function compareFiles(file1, file2) {
    const content1 = fs.readFileSync(file1);
    const content2 = fs.readFileSync(file2);

    // Compare content
    const contentEqual = content1.equals(content2);

    // Get metadata
    const stats1 = fs.statSync(file1);
    const stats2 = fs.statSync(file2);

    // Compare metadata
    const statsEqual = stats1.size === stats2.size && stats1.mtime.getTime() === stats2.mtime.getTime();

    return {
        contentEqual,
        statsEqual
    };
}

const compared =
    compareFiles(
        '/Users/temp/Documents/gits/exp-buffer-stream/bc84a3c1-4fe3-4a10-abe8-f3d2d6803b60/data_1.json',
        '/Volumes/isolation/exp-datas/json_files/data_1.json'
        );

console.log(compared.contentEqual, compared.statsEqual);

module.exports = compareFiles;