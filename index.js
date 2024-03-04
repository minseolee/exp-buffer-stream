delete require.cache[require.resolve('fs')];


const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { v4: uuidV4 } = require('uuid');
const Monitor = require('./monitor');
const compressing = require("compressing")


const ISO_FILE_PATH = '/Volumes/isolation/exp-datas';
const TEMPS_PATH = path.join(__dirname, '../', '../', 'temps');


(async () => {
   async function expCopyFile() {
      try {
         const monitor = new Monitor(process, performance, 10);

         const startTime = monitor.getPerfTime();
         monitor.startMemoryMonitor();

         const files = await fs.promises.readdir(path.join(ISO_FILE_PATH, '/json_files'));
         const uuid = uuidV4();

         fs.mkdirSync(path.join(TEMPS_PATH, uuid));


         const len = files.length;
         for (let i = 0; i < len; i++) {
            await fs.promises.copyFile(path.join(ISO_FILE_PATH, '/json_files', files[i]), path.join(TEMPS_PATH, uuid, files[i]));
         }

         compressing.zip.compressDir(path.join(TEMPS_PATH, uuid), path.join(TEMPS_PATH, `${uuid}.zip`))
             .then(() => {
                 const endTime = monitor.getPerfTime();
                 monitor.clearMemoryMonitor();
                 monitor.log(startTime, endTime, 'copyfile', uuid);
             });
      } catch (e) {
         console.error(e);
      }
   }


   // async function expStreamPipe() {
   //    try {
   //       const monitor = new Monitor(process, performance, 10);
   //       const startTime = monitor.getPerfTime();
   //       monitor.startMemoryMonitor();
   //       const uuid = uuidV4();
   //
   //       /////////////---INITIALIZE---//////////////
   //
   //       const JSON_FILES = path.join(ISO_FILE_PATH, '/json_files');
   //       const files = await fs.promises.readdir(JSON_FILES);
   //
   //       const writeStream = fs.createWriteStream(path.join(TEMPS_PATH, `${uuid}.zip`));
   //       const archive = archiver('zip', { zlib: { level: 9 } });
   //
   //       archive.pipe(writeStream);
   //
   //       for (const file of files) {
   //           archive.append(path.join(ISO_FILE_PATH, '/json_files', file), { name: file });
   //       }
   //
   //      await archive.finalize();
   //
   //
   //       writeStream.on('finish', () => {
   //           const endTime = performance.now();
   //           monitor.clearMemoryMonitor();
   //           monitor.log(startTime, endTime, 'stream', uuid);
   //       })
   //
   //       // await fs.promises.rm(path.join(__dirname, `/${uuid}.zip`));
   //    } catch (e) {
   //       console.error(e);
   //    }
   // }


   async function expStreamCompressing() {
      const monitor = new Monitor(process, performance, 10);

      const startTime = monitor.getPerfTime();
      monitor.startMemoryMonitor();

      const files = await fs.promises.readdir(path.join(ISO_FILE_PATH, '/json_files'));
      const uuid = uuidV4();


      const zipStream = new compressing.zip.Stream();
      const writeStream = fs.createWriteStream(path.join(TEMPS_PATH, `${uuid}.zip`));

      zipStream
          .pipe(writeStream)
          .on('error', (err) => {console.error(err)});

      const len = files.length;
      for (let i = 0; i < len; i++) {
         zipStream.addEntry(path.join(ISO_FILE_PATH, '/json_files', files[i]));
      }


      writeStream.on('finish', () => {
         const endTime = monitor.getPerfTime();
         monitor.clearMemoryMonitor();
         monitor.log(startTime, endTime, 'streamCompressing', uuid);
      });
   }


   await expCopyFile();
   // await expStreamPipe();
   await expStreamCompressing();
})();


