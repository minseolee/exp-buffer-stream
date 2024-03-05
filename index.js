delete require.cache[require.resolve('fs')];

const osu = require("os-utils");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { v4: uuidV4 } = require('uuid');
const Monitor = require('./utils/monitor');
const compressing = require("compressing");

const ISO_FILE_PATH = '/Volumes/isolation/exp-datas';
const TEMPS_PATH = path.join(__dirname, '../', '../', 'temps');
// const {performance} = require("perf_hooks");
// const ISO_FILE_PATH = __dirname;
// const TEMPS_PATH = path.join(__dirname, 'temps');

(async () => {
   async function expCopyFile() {
      try {
         const monitor = new Monitor(osu, process, performance, 10);

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
                 monitor.log(startTime, endTime, 'copyfile', uuid);
             });
      } catch (e) {
         console.error(e);
      }
   }

   async function expStreamCompressing() {
      const monitor = new Monitor(osu, process, performance, 10);

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
         monitor.log(startTime, endTime, 'streamCompressing', uuid);
      });
   }


   await expCopyFile();
   await expStreamCompressing();
})();


