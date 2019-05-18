const bunyan = require('bunyan')
const config = require('./config')

const levels = {
    error: 0,
    warning: 1,
    debug: 2,

};

let getRotatingFileStream = (level, fileName) => {
    return {
        level: level,
        type: 'rotating-file',
        path: fileName,
        period: config.log.rotationPeriod
    }
}

let reqSerializer = (req) => {
    return {
         method: req.method,
         url: req.originalUrl,
         headers: req.headers,
     }
 }

const errorLogger = bunyan.createLogger({
    name: 'Postifi-Backend-Error',
    serializers: {
        request: reqSerializer,
        info: (info)=>{return info}
    },
    streams: [
        getRotatingFileStream('error', config.log.errorFile),
    ]
});

const infoLogger = bunyan.createLogger({
    name: 'Postifi-Backend-Info',
    streams: [
        {
            level: config.production?'info':'fatal',
            stream: process.stdout
        }
    ]
});

module.exports = {
    fatal: errorLogger.fatal.bind(errorLogger),
    error: errorLogger.error.bind(errorLogger),
    warn: infoLogger.warn.bind(infoLogger),
    info: infoLogger.info.bind(infoLogger),
    debug: infoLogger.debug.bind(infoLogger),
    trace: infoLogger.trace.bind(infoLogger)
}