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

    testLog : function(message,level = 'error'){
        if(level == 'error')
            console.log('[TEST-FAILED]', message, (new Error()).stack.split("\n")[3].trim());
        else
            console.log('[TEST-WARNING]', message, (new Error()).stack.split("\n")[3].trim());
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