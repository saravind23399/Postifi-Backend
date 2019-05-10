const isProduction = false

let productionConfig = {
    dbUrl: ''
}

let devConfig = {
    dbUrl: ''
}

module.exports = isProduction?productionConfig:devConfig