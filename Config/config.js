const isProduction = false

let productionConfig = {
    dbUrl: process.env.MONGODB_ADDON_URI,
    log:{
        errorFile: './Logs/logs.log',
        rotationPeriod: '4.5d',
    },
    port: process.env.PORT
}

let devConfig = {
    dbUrl: 'mongodb://localhost:27017/postifi',
    log:{
        errorFile: './Logs/logs.log',
        rotationPeriod: '1m',
    },
    port: 3000
}

module.exports = isProduction?productionConfig:devConfig