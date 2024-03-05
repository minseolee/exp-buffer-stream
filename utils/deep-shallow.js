const fs = require('fs');

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


module.exports = compareFiles;