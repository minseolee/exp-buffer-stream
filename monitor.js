const {doubleNextByte, mSecToSec} = require("./format");

class Monitor {
    _osu = null;
    _proc = null;
    _perf = null;
    _interval = 100;

    _memoryMonitor = null;

    MAX_cpu = 0;
    MAX_rss = 0;
    MAX_heapTotal = 0;
    MAX_heapUsed = 0;
    MAX_external = 0;

    SUM_cpu = 0;
    SUM_rss = 0;
    SUM_heapTotal = 0;
    SUM_heapUsed = 0;
    SUM_external = 0;

    iteration = 0;

    constructor(osu, process, performance, interval) {
        this._osu = osu;
        this._proc = process;
        this._perf = performance;
        this._interval = interval;
    }

    startMemoryMonitor() {
        this._memoryMonitor = setInterval(() => {
            this._osu.cpuUsage((cpuU) => {
                if (this.MAX_cpu < cpuU) this.MAX_cpu = cpuU;
                this.SUM_cpu += cpuU;
            })

            const {rss, external, heapTotal, heapUsed} = this._proc.memoryUsage();

            if (this.MAX_rss < rss) this.MAX_rss = rss;
            if (this.MAX_external < external) this.MAX_external = external;
            if (this.MAX_heapUsed < heapUsed) this.MAX_heapUsed = heapUsed;
            if (this.MAX_heapTotal < heapTotal) this.MAX_heapTotal = heapTotal;

            this.SUM_rss += rss;
            this.SUM_external += external;
            this.SUM_heapUsed += heapUsed;
            this.SUM_heapTotal += heapTotal;

            this.iteration++;
        }, this._interval);
    }

    clearMemoryMonitor() {
        clearInterval(this._memoryMonitor);
    }

    getPerfTime() {
        return this._perf.now();
    }

    log(startTime, endTime, name, uuid) {
        console.log(`===========${name} RESULT ${uuid}============`);
        console.log('run time(ms)', endTime - startTime);
        console.log('total iter', this.iteration);
        console.log('max(%)', Number(this.MAX_cpu.toFixed(2)));
        console.log('avg(%)', Number((this.SUM_cpu / this.iteration).toFixed(2)));
        console.log('max(MB)', doubleNextByte(this.MAX_rss), doubleNextByte(this.MAX_external), doubleNextByte(this.MAX_heapUsed), doubleNextByte(this.MAX_heapTotal));
        console.log('avg(MB)', doubleNextByte(this.SUM_rss / this.iteration), doubleNextByte(this.SUM_external / this.iteration), doubleNextByte(this.SUM_heapUsed / this.iteration), doubleNextByte(this.SUM_heapTotal / this.iteration));
        console.log('=============================')
    }
}

module.exports = Monitor;