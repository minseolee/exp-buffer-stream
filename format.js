function nextByte(n) {
    return Math.floor(n / 1024);
}

function doubleNextByte(n) {
    return Math.floor(n / 1024 / 1024);
}

function mSecToSec(n) {
    return Math.floor(n / 1000);
}

module.exports = {
    nextByte,
    doubleNextByte,
    mSecToSec
}