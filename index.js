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

         function deepCopyFile(sourcePath, destinationPath) {
            return new Promise((resolve, reject) => {
               const readStream = fs.createReadStream(sourcePath);
               const writeStream = fs.createWriteStream(destinationPath);

               readStream.on('error', reject);
               writeStream.on('error', reject);
               writeStream.on('finish', resolve);

               readStream.pipe(writeStream);
            });
         }

         async function deepCopyFiles(sourceDir, destinationDir) {
            try {
               // Get a list of files in the source directory
               const files = await fs.promises.readdir(sourceDir);
               const promises = [];

               // Iterate over each file
               for (const file of files) {
                  const sourcePath = path.join(sourceDir, file);
                  const destinationPath = path.join(destinationDir, file);

                  // Perform a deep copy for each file
                   promises.push(deepCopyFile(sourcePath, destinationPath));
               }

               await Promise.all(promises);
            } catch (error) {
               console.error('Error copying files:', error);
            }
         }

         const JSON_FILES = path.join(ISO_FILE_PATH, '/json_files');

         await fs.promises.mkdir(path.join(__dirname, uuid));

         await deepCopyFiles(JSON_FILES, path.join(__dirname, uuid));

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


