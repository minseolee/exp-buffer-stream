class Monitor {
    _proc = null;
    _perf = null;
    _interval = 100;

    _memoryMonitor = null;

    MAX_rss = 0;
    MAX_heapTotal = 0;
    MAX_heapUsed = 0;
    MAX_external = 0;

    SUM_rss = 0;
    SUM_heapTotal = 0;
    SUM_heapUsed = 0;
    SUM_external = 0;

    iteration = 0;

    constructor(process, performance, interval) {
        this._proc = process;
        this._perf = performance;
        this._interval = interval;
    }

    startMemoryMonitor() {
        this._memoryMonitor = setInterval(() => {
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
        }, 10);
    }

    clearMemoryMonitor() {
        clearInterval(this._memoryMonitor);
    }

    getPerfTime() {
        return this._perf.now();
    }

    log(startTime, endTime) {
        console.log('===========RESULT============')
        console.log('run time(ms)', endTime - startTime);
        console.log('total iter', this.iteration);
        console.log('max(bytes)', this.MAX_rss, this.MAX_external, this.MAX_heapUsed, this.MAX_heapTotal);
        console.log('avg(bytes)', Math.floor(this.SUM_rss / this.iteration), Math.floor(this.SUM_external / this.iteration), Math.floor(this.SUM_heapUsed / this.iteration), Math.floor(this.SUM_heapTotal / this.iteration));
        console.log('=============================')
    }
}

module.exports = Monitor;