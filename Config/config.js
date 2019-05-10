const isProduction = false

let productionConfig = {
    dbUrl: ''
}

let devConfig = {
    dbUrl: process.env.MONGODB_ADDON_URI
}

module.exports = isProduction?productionConfig:devConfig