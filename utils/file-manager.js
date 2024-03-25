const fs = require("fs");

class FM {
    static chkAndRm(DST_PATH) {
        console.log("FM")
        if (fs.existsSync(DST_PATH)) {
            fs.rmSync(DST_PATH, { recursive: true, force: true });
            fs.mkdirSync(DST_PATH);
        } else {
            fs.mkdirSync(DST_PATH);
        }
    }
}


module.exports = FM;