const fs = require("fs");
const path = require("path");

class CsvWriter {
    _dir = null;
    _filename = null;

    constructor(dir, filename) {
        this._dir = dir;
        this._filename = filename;
    }

    async append(s) {
        await fs.promises.appendFile(path.join(this._dir, this._filename), s + "\n");
    }
}

module.exports = CsvWriter;