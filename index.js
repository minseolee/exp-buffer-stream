const express = require('express');
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const archiver = require("archiver");
const { v4: uuidV4 } = require('uuid');


const app = express();

const FILE_PATH = path.join(__dirname, './json_files');
const TEMP_PATH = path.join(__dirname, './temp');
const ZIP_PATH = '';


app.get('/experiment/buffer', async (req, res) => {
   await fs.promises.copyFile(FILE_PATH, TEMP_PATH);


   await res.download(FILE_PATH);
});


app.get('/experiment/pipe', async (req, res) => {
   try {
      const startTime = performance.now();
      let MAX_rss = 0;
      let MAX_heapTotal = 0;
      let MAX_heapUsed = 0;
      let MAX_external = 0;

      let SUM_rss = 0;
      let SUM_heapTotal = 0;
      let SUM_heapUsed = 0;
      let SUM_external = 0;

      let iteration = 0;

      const memoryMonitor = setInterval(() => {
         const { rss, external, heapTotal, heapUsed } = process.memoryUsage();
         if (MAX_rss < rss) MAX_rss = rss;
         if (MAX_external < external) MAX_external = external;
         if (MAX_heapUsed < heapUsed) MAX_heapUsed = heapUsed;
         if (MAX_heapTotal < heapTotal) MAX_heapTotal = heapTotal;

         SUM_rss += rss;
         SUM_external += external;
         SUM_heapUsed += heapUsed;
         SUM_heapTotal += heapTotal;

         iteration++;
      }, 10);


      const files = await fs.promises.readdir(FILE_PATH)

      const uuid = uuidV4();
      const output = await fs.createWriteStream(__dirname + `/${uuid}.zip`);
      const archive = await archiver('zip', {zlib: {level: 9}});

      archive.on('error', (err) => { throw err; });

      archive.pipe(output);

      for (const file of files)
         await archive.append(fs.createReadStream(path.join(FILE_PATH, file)), {name: file});

      await archive.finalize();


      const endTime = performance.now();
      clearInterval(memoryMonitor);

      console.log('===========RESULT============')
      console.log('run time(ms)', endTime - startTime);
      console.log('total iter', iteration);
      console.log('max(bytes)', MAX_rss, MAX_external, MAX_heapUsed, MAX_heapTotal);
      console.log('avg(bytes)', Math.floor(SUM_rss / iteration), Math.floor(SUM_external / iteration), Math.floor(SUM_heapUsed / iteration), Math.floor(SUM_heapTotal / iteration));
      console.log('=============================')

      await fs.promises.rm(__dirname + `/${uuid}.zip`);

      return res.status(200).send({ uuid });
   } catch (e) {
      console.error(e);
   }
});


app.listen(5050, async () => {
   console.log('server on 5050');
})
