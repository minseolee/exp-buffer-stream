delete require.cache[require.resolve('fs')];


const express = require('express');
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { v4: uuidV4 } = require('uuid');
const Monitor = require('./monitor');
const compressing = require("compressing");
const constants = require("constants");


const app = express();

const FILE_PATH = path.join(__dirname, './json_files');
const TEMP_PATH = path.join(__dirname, './temp');

const ISO_FILE_PATH = '/Volumes/isolation/exp-datas';


app.get('/', async (req, res) => {
   const stat = await fs.promises.stat('/');
   console.log(stat);

   console.log(path.parse(__dirname));

   res.status(200).send({ msg: 'ok' });
});

app.get('/experiment/buffer', async (req, res) => {
   try {
      const zip = (source, destination) => {
         return compressing.zip.compressDir(source, destination);
      };

      const monitor = new Monitor('BUFFER', process, performance, 10);
      const startTime = monitor.getPerfTime();
      monitor.startMemoryMonitor();

      const files = await fs.promises.readdir(path.join(ISO_FILE_PATH, '/json_files'));
      const uuid = uuidV4();

      // const ZIP_PATH = path.join(__dirname, `/${uuid}.zip`);

      await fs.promises.mkdir(path.join(__dirname, uuid));

      for (const file of files)
         await fs.promises.copyFile(path.join(ISO_FILE_PATH, '/json_files', file), path.join(__dirname, uuid, file), constants.COPYFILE_EXCL);

      const archive = archiver('zip', {zlib: {level: 9}});
      archive.directory(uuid, false);

      // await zip(TEMP_PATH, ZIP_PATH);


      const endTime = performance.now();
      monitor.clearMemoryMonitor();
      monitor.log(startTime, endTime)

      // await fs.promises.rm(path.join(__dirname, `/${uuid}.zip`));

      return res.status(200).send({ uuid });
   } catch (e) {
      console.error(e);
      return res.status(500).send({ message: '500' });
   }
});


app.get('/experiment/pipe', async (req, res) => {
   try {
      const monitor = new Monitor('PIPE', process, performance, 10);
      const startTime = monitor.getPerfTime();
      monitor.startMemoryMonitor();
      const uuid = uuidV4();

      /////////////---INITIALIZE---//////////////

      async function zipByStream(sourceDir, targetDir, files) {
         const archive = archiver('zip', { zlib: { level: 9 } });
         const archiveStream = fs.createWriteStream(path.join(targetDir, `${uuid}.zip`), { highWaterMark: 1024 * 1024 });

         archiveStream.on('close', () => {
            console.log('Archive created successfully.', uuid);
         });

         archive.on('error', (err) => {
            throw err;
         });

         archive.pipe(archiveStream);

         const copyPromises = files.map(async file => {
            const sourcePath = path.join(sourceDir, file);
            const targetPath = file;

            const readStream = fs.createReadStream(sourcePath, { highWaterMark: 1024 * 1024 });

            return new Promise((resolve, reject) => {
               readStream.on('error', reject);
               readStream.on('end', resolve);

               archive.append(readStream, { name: targetPath });
            });
         });

         await Promise.all(copyPromises);
         await archive.finalize();
      }

      const JSON_FILES = path.join(ISO_FILE_PATH, '/json_files');
      const files = await fs.promises.readdir(JSON_FILES);


      await zipByStream(JSON_FILES, __dirname, files);


      /////////////---FINALIZE---//////////////

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
