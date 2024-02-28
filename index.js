delete require.cache[require.resolve('fs')];


const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { v4: uuidV4 } = require('uuid');
const Monitor = require('./monitor');
const compareFiles = require("./deep-shallow");


const ISO_FILE_PATH = '/Volumes/isolation/exp-datas';


(async () => {
   async function expCopyFile() {
      try {
         const monitor = new Monitor(process, performance, 10);

         const startTime = monitor.getPerfTime();
         monitor.startMemoryMonitor();

         const files = await fs.promises.readdir(path.join(ISO_FILE_PATH, '/json_files'));
         const uuid = uuidV4();


         await fs.promises.mkdir(path.join(__dirname, uuid));

         for (const file of files) {
            await fs.promises.copyFile(path.join(ISO_FILE_PATH, '/json_files', file), path.join(__dirname, uuid, file));
         }

         const archive = archiver('zip', {zlib: {level: 9}});
         archive.directory(uuid, false);


         const endTime = performance.now();
         monitor.clearMemoryMonitor();
         monitor.log(startTime, endTime, 'copyfile', uuid);

         // await fs.promises.rm(path.join(__dirname, `/${uuid}.zip`));
      } catch (e) {
         console.error(e);
      }
   }


   async function expStreamPipe() {
      try {
         const monitor = new Monitor(process, performance, 10);
         const startTime = monitor.getPerfTime();
         monitor.startMemoryMonitor();
         const uuid = uuidV4();

         /////////////---INITIALIZE---//////////////

         async function zipByStream(sourceDir, targetDir, files) {
            const archive = archiver('zip', { zlib: { level: 9 } });
            const archiveStream = fs.createWriteStream(path.join(targetDir, `${uuid}.zip`));


            archive.on('error', (err) => {
               throw err;
            });

            archive.pipe(archiveStream);

            const copyPromises = files.map(async file => {
               const sourcePath = path.join(sourceDir, file);
               const targetPath = file;

               const readStream = fs.createReadStream(sourcePath);

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
         monitor.log(startTime, endTime, 'stream', uuid)

         // await fs.promises.rm(path.join(__dirname, `/${uuid}.zip`));
      } catch (e) {
         console.error(e);
      }
   }

   await expCopyFile();
   await expStreamPipe();
})();


