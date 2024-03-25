const fs = require('fs');
const crypto = require('crypto');

// 왜 실행할떄마다 해쉬가 다르게 나오냐??????
// Function to compute hash of a file
// async function getFileHash(filePath) {
//     return new Promise((resolve, reject) => {
//         const hash = crypto.createHash('sha1');
//         const stream = fs.createReadStream(filePath);
//
//         stream.on('error', reject);
//
//         stream.on('data', chunk => {
//             hash.update(chunk);
//         });
//
//         stream.on('end', () => {
//             const fileHash = hash.digest('base64');
//             resolve(fileHash);
//         });
//     });
// }

async function getFileHash(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, fileContents) => {
            if (err) reject(err);
            const hash = crypto.createHash('sha1').update(fileContents).digest('hex');
            resolve(hash);
        });
    });
}

module.exports = getFileHash;