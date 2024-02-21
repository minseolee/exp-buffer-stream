const express = require('express');
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const archiver = require("archiver");
const { v4: uuidV4 } = require('uuid');
const Monitor = require('./monitor');
const compressing = require("compressing");


const app = express();

const FILE_PATH = path.join(__dirname, './json_files');
const TEMP_PATH = path.join(__dirname, './temp');


app.get('/experiment/buffer', async (req, res) => {
   try {
      const zip = (source, destination) => {
         return compressing.zip.compressDir(source, destination);
      };

      const monitor = new Monitor(process, performance, 100);
      const startTime = monitor.getPerfTime();
      monitor.startMemoryMonitor();

      const files = await fs.promises.readdir(FILE_PATH)
      const uuid = uuidV4();

      const ZIP_PATH = path.join(__dirname, `/${uuid}.zip`);

      for (const file of files)
         await fs.promises.copyFile(path.join(__dirname, '/json_files', file), path.join(TEMP_PATH, file));


      await zip(TEMP_PATH, ZIP_PATH);


      const endTime = performance.now();
      monitor.clearMemoryMonitor();
      monitor.log(startTime, endTime)

      await fs.promises.rm(path.join(__dirname, `/${uuid}.zip`));

      return res.status(200).send({ uuid });
   } catch (e) {
      console.error(e);
      return res.status(500).send({ message: '500' });
   }
});


app.get('/experiment/pipe', async (req, res) => {
   try {
      const monitor = new Monitor(process, performance, 100);
      const startTime = monitor.getPerfTime();
      monitor.startMemoryMonitor();

      const files = await fs.promises.readdir(FILE_PATH)
      const uuid = uuidV4();
      const output = await fs.createWriteStream(path.join(__dirname, `/${uuid}.zip`));
      const archive = await archiver('zip', {zlib: {level: 9}});

      archive.on('error', (err) => { throw err; });
      archive.pipe(output);

      for (const file of files)
         await archive.append(fs.createReadStream(path.join(FILE_PATH, file)), {name: file});


      await archive.finalize();
      const endTime = performance.now();
      monitor.clearMemoryMonitor();
      monitor.log(startTime, endTime)

      await fs.promises.rm(path.join(__dirname, `/${uuid}.zip`));

      return res.status(200).send({ uuid });
   } catch (e) {
      console.error(e);
   }
});


app.listen(5050, async () => {
   console.log('server on 5050');
})
