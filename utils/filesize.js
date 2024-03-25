const fs = require("fs");

function getFileSize(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                const fileSize = stats.size;
                resolve(fileSize);
            }
        });
    });
}

module.exports = getFileSize;