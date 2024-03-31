delete require.cache[require.resolve('fs')];

const osu = require("os-utils");
const fs = require("fs");
const path = require("path");
const { v4: uuidV4 } = require('uuid');
const Monitor = require('./utils/monitor');
const compressing = require("compressing");
const getFileSize = require("./utils/filesize");
const FM = require("./utils/file-manager");


// const ISO_FILE_PATH = '/Volumes/isolation/exp-datas';

const SRC_PATH = path.join(__dirname, 'target_files');
const DST_PATH = path.join(__dirname, 'dst');

// const {performance} = require("perf_hooks");
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
      try {
         // FM.chkAndRm(DST_PATH);

         const monitor = new Monitor(osu, process, performance, 10,
             {eachSize: eachSize, totalSize: totalSize, csvDir: csvDir__copy, csvName: csvName__copy}
         );

         const startTime = monitor.getPerfTime();
         monitor.startMemoryMonitor();
         const uuid = uuidV4();

         const files = await fs.promises.readdir(SRC_PATH);

         //////


         fs.mkdirSync(path.join(DST_PATH, uuid));

         const len = files.length;
         for (let i = 0; i < len; i++) {
            await fs.promises.copyFile(path.join(SRC_PATH, files[i]), path.join(DST_PATH, uuid, files[i]));
         }

         compressing.zip.compressDir(path.join(DST_PATH, uuid), path.join(DST_PATH, `${uuid}.zip`))
             .then(async () => {
                 const endTime = monitor.getPerfTime();
                 // const hash = await getFileHash(path.join(TEMPS_PATH, `${uuid}.zip`));
                 const size = await getFileSize(path.join(DST_PATH, `${uuid}.zip`));

                 monitor.log(len, startTime, endTime, 'COPY', uuid, size, eachSize);
                 monitor.clearMemoryMonitor();

                 fs.rmSync(path.join(DST_PATH, `${uuid}`), {force: true, recursive: true});
                 fs.rmSync(path.join(DST_PATH, `${uuid}.zip`), {force: true, recursive: true});
             });
      } catch (e) {
         console.error(e);
      }
   }

   async function expStreamCompressing() {
      try {
         // FM.chkAndRm(DST_PATH);

         const monitor = new Monitor(osu, process, performance, 10,
             {eachSize: eachSize, totalSize: totalSize, csvDir: csvDir__stream, csvName: csvName__stream}
         );

         const startTime = monitor.getPerfTime();
         monitor.startMemoryMonitor();
         const uuid = uuidV4();

         const files = await fs.promises.readdir(SRC_PATH);


         const zipStream = new compressing.zip.Stream();
         const writeStream = fs.createWriteStream(path.join(DST_PATH, `${uuid}.zip`));

         zipStream
             .pipe(writeStream)
             .on('error', (err) => {
                console.error(err)
             });

         const len = files.length;
         for (let i = 0; i < len; i++) {
            // zipStream.addEntry(path.join(SRC_PATH, files[i]));
            zipStream.addEntry(fs.createReadStream(path.join(SRC_PATH, files[i])), { relativePath: `${uuid}.zip` })
         }


         writeStream.on('finish', async () => {
            const endTime = monitor.getPerfTime();
            // const hash = await getFileHash(path.join(DST_PATH, `${uuid}.zip`));
            const size = await getFileSize(path.join(DST_PATH, `${uuid}.zip`));

            monitor.log(len, startTime, endTime, 'STREAM', uuid, size, eachSize);
            monitor.clearMemoryMonitor();

            fs.rmSync(path.join(DST_PATH, `${uuid}.zip`));
         });
      } catch (e) {
         console.error(e);
      }
   }

   await expStreamCompressing();
   setTimeout(() => expCopyFile(), 1000);
   // await expCopyFile();
})();


