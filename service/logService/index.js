module.exports = logs={

    logLevel: ['debug', 'error', 'info', 'warn','fatal','clog'],
    logLevelMap: {
        debug: '[DLOG]',
        error: '[ELOG]',
        info: '[ILOG]',
        warn: '[WLOG]',
        fatal: '[FLOG]',
        clog: '[CLOG]'
    },
    allowedLogLevel: ['debug','clog','error','info','warn','fatal'],
    log: function(logLevel, message){
        if(this.allowedLogLevel.includes(logLevel)){
            console.log(this.logLevelMap[logLevel],message);
        }
    },

    setLogLevel: function(logLevel){
        if(this.logLevel.includes(logLevel)){
            this.allowedLogLevel = logLevel;
        }
    },

    removeLogLevel: function(logLevel){
        if(this.logLevel.includes(logLevel) && logLevel != 'clog'){
            this.allowedLogLevel = this.allowedLogLevel.filter(item => item !== logLevel);
        }
    }

}