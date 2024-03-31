const {doubleNextByte} = require("./format");
const CsvWriter = require("./csv-writer");

class Monitor {
    _osu = null;
    _proc = null;
    _perf = null;
    _interval = 10;
    _csvWriter = null;
    _csvInfo = null;

    _memoryMonitor = null;

    MAX_cpu = 0;
    MAX_rss = 0;
    MAX_heapTotal = 0;
    MAX_heapUsed = 0;
    MAX_external = 0;


    MIN_cpu = 2147483647;
    MIN_rss = 2147483647;

    SUM_cpu = 0;
    SUM_rss = 0;
    SUM_heapTotal = 0;
    SUM_heapUsed = 0;
    SUM_external = 0;

    iteration = 0;

    constructor(osu, process, performance, interval, csvInfo) {
        this._osu = osu;
        this._proc = process;
        this._perf = performance;
        this._interval = interval;
        this._csvInfo = csvInfo;
        this._csvWriter = new CsvWriter(csvInfo.csvDir, csvInfo.csvName);
    }

    startMemoryMonitor() {
        this._memoryMonitor = setInterval(() => {
            this._osu.cpuUsage((cpuU) => {
                if (this.MAX_cpu < cpuU) this.MAX_cpu = cpuU;
                if (this.MIN_cpu > cpuU && cpuU !== 0) this.MIN_cpu = cpuU;
                this.SUM_cpu += cpuU;
            })

            const {rss, external, heapTotal, heapUsed} = this._proc.memoryUsage();

            if (this.MAX_rss < rss) this.MAX_rss = rss;
            if (this.MAX_external < external) this.MAX_external = external;
            if (this.MAX_heapUsed < heapUsed) this.MAX_heapUsed = heapUsed;
            if (this.MAX_heapTotal < heapTotal) this.MAX_heapTotal = heapTotal;

            if (this.MIN_rss > rss) this.MIN_rss = rss;

            this.SUM_rss += rss;
            this.SUM_external += external;
            this.SUM_heapUsed += heapUsed;
            this.SUM_heapTotal += heapTotal;

            this.iteration++;
        }, this._interval);
    }

    clearMemoryMonitor() {
        clearInterval(this._memoryMonitor);
        this._memoryMonitor = null;
    }

    getPerfTime() {
        return this._perf.now();
    }

    log(quantity, startTime, endTime, name, uuid, size) {
        const runTime = Number((endTime - startTime).toFixed(3));
        const totalIter = this.iteration;
        const minCPU = Number(this.MIN_cpu.toFixed(5));
        const maxCPU = Number(this.MAX_cpu.toFixed(5));
        const avgCPU = Number((this.SUM_cpu / this.iteration).toFixed(5));
        // const maxMEM = doubleNextByte(this.MAX_rss), doubleNextByte(this.MAX_external), doubleNextByte(this.MAX_heapUsed), doubleNextByte(this.MAX_heapTotal);
        // const avgMEM = doubleNextByte(this.SUM_rss / this.iteration), doubleNextByte(this.SUM_external / this.iteration), doubleNextByte(this.SUM_heapUsed / this.iteration), doubleNextByte(this.SUM_heapTotal / this.iteration)
        const minMEM = doubleNextByte(this.MIN_rss);
        const maxMEM = doubleNextByte(this.MAX_rss);
        const avgMEM = doubleNextByte(this.SUM_rss / this.iteration);


        console.log(`===========${name} RESULT ============`);
        console.log('size ', size);
        console.log('run time(ms)', runTime);
        console.log('total iter', totalIter);
        console.log('min(%)', minCPU);
        console.log('max(%)', maxCPU);
        console.log('avg(%)', avgCPU);
        console.log('min(MB)', minMEM)
        console.log('max(MB)', maxMEM);
        console.log('avg(MB)', avgMEM);
        console.log('=============================')
        this._csvWriter.append(`${quantity}, ${size}, ${this._csvInfo.eachSize}, ${this._csvInfo.totalSize}, ${runTime}, ${totalIter}, ${minCPU}, ${maxCPU}, ${avgCPU}, ${minMEM}, ${maxMEM}, ${avgMEM}`);

        this.clearMemoryMonitor();
    }
}

module.exports = Monitor;