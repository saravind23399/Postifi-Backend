const isProduction = false

let productionConfig = {
    dbUrl: process.env.MONGODB_ADDON_URI,
    log:{
        errorFile: './Logs/logs.log',
        rotationPeriod: '4.5d',
    }
}

let devConfig = {
    dbUrl: 'mongodb://localhost:27017/postifi',
    log:{
        errorFile: './Logs/logs.log',
        rotationPeriod: '1m',
    }
}

module.exports = isProduction?productionConfig:devConfig