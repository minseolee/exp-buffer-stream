delete require.cache[require.resolve('fs')];

const osu = require("os-utils");
const fs = require("fs");
const path = require("path");
const { v4: uuidV4 } = require('uuid');
const Monitor = require('./utils/monitor');
const compressing = require("compressing");
const DateTimeString = require("./utils/datetime");
const getFileHash = require("./utils/hash");
const getFileSize = require("./utils/filesize");

const ISO_FILE_PATH = '/Volumes/isolation/exp-datas';
const TEMPS_PATH = path.join(__dirname, '../', '../', 'temps');
// const {performance} = require("perf_hooks");
// const ISO_FILE_PATH = __dirname;
// const TEMPS_PATH = path.join(__dirname, 'temps');


const sizeBe = process.env.SIZEBE || 0;

const eachSize = process.env.EACHSIZE || 0;
const totalSize = process.env.TOTALSIZE || 0;

const csvDir__copy = process.env.CSVDIR__COPY || __dirname;
const csvName__copy = process.env.CSVNAME__COPY || "copy.csv";

const csvDir__stream = process.env.CSVDIR__STREAM || __dirname;
const csvName__stream = process.env.CSVNAME__STREAM || "stream.csv";

(async () => {
   async function expCopyFile() {
      const uuid = 'uuid';

      try {
         const monitor = new Monitor(osu, process, performance, 10,
             {eachSize: eachSize, totalSize: totalSize, csvDir: csvDir__copy, csvName: csvName__copy}
         );

         const startTime = monitor.getPerfTime();
         monitor.startMemoryMonitor();

         const files = await fs.promises.readdir(path.join(ISO_FILE_PATH, '/json_files'));
         // const uuid = uuidV4();

         //////


         fs.mkdirSync(path.join(TEMPS_PATH, uuid));

         const len = files.length;
         for (let i = 0; i < len; i++) {
            await fs.promises.copyFile(path.join(ISO_FILE_PATH, '/json_files', files[i]), path.join(TEMPS_PATH, uuid, files[i]));
         }

         compressing.zip.compressDir(path.join(TEMPS_PATH, uuid), path.join(TEMPS_PATH, `${uuid}.zip`))
             .then(async () => {
                 const endTime = monitor.getPerfTime();
                 const hash = await getFileHash(path.join(TEMPS_PATH, `${uuid}.zip`));
                 const size = await getFileSize(path.join(TEMPS_PATH, `${uuid}.zip`));
                 console.log(hash, size);

                 monitor.log(startTime, endTime, 'copyfile', uuid, Number(size === sizeBe));
                 monitor.clearMemoryMonitor();

                 await fs.promises.rm(path.join(TEMPS_PATH, `${uuid}`), {force: true, recursive: true});
                 await fs.promises.rm(path.join(TEMPS_PATH, `${uuid}.zip`), {force: true, recursive: true});
             });
      } catch (e) {
         console.error(e);
      } finally {

      }
   }

   async function expStreamCompressing() {
      const monitor = new Monitor(osu, process, performance, 10,
          {eachSize: eachSize, totalSize: totalSize, csvDir: csvDir__stream, csvName: csvName__stream}
      );

      const startTime = monitor.getPerfTime();
      monitor.startMemoryMonitor();

      const files = await fs.promises.readdir(path.join(ISO_FILE_PATH, '/json_files'));
      // const uuid = uuidV4();
      const uuid = 'uuid';

      ////

      const zipStream = new compressing.zip.Stream();
      const writeStream = fs.createWriteStream(path.join(TEMPS_PATH, `${uuid}.zip`));

      zipStream
          .pipe(writeStream)
          .on('error', (err) => {console.error(err)});

      const len = files.length;
      for (let i = 0; i < len; i++) {
         zipStream.addEntry(path.join(ISO_FILE_PATH, '/json_files', files[i]));
      }


      writeStream.on('finish', async () => {
         const endTime = monitor.getPerfTime();
         const hash = await getFileHash(path.join(TEMPS_PATH, `${uuid}.zip`));
         const size = await getFileSize(path.join(TEMPS_PATH, `${uuid}.zip`));
         console.log(hash, size);
         monitor.log(startTime, endTime, 'streamCompressing', uuid, Number(size === sizeBe));
         await fs.promises.rm(path.join(TEMPS_PATH, `${uuid}.zip`));

         monitor.clearMemoryMonitor();
      });
   }


   await expCopyFile();
   await expStreamCompressing();
})();


