const isProduction = false

let productionConfig = {
    production: true,
    dbUrl: process.env.MONGODB_ADDON_URI,
    log:{
        errorFile: './Logs/logs.log',
        rotationPeriod: '4.5d',
    },
    googleOAuth:{
        clientId: '271364661089-186f38cugovk271ke8ktvqrmo49gd9ss.apps.googleusercontent.com',
        secret: 'F30gbFMzB3eX_1mks5tj4qdg'
    },
    port: process.env.PORT
}

let devConfig = {
    production: false,
    dbUrl: 'mongodb://localhost:27017/postifi',
    log:{
        errorFile: './Logs/logs.log',
        rotationPeriod: '1m',
    },
    googleOAuth:{
        clientId: '271364661089-186f38cugovk271ke8ktvqrmo49gd9ss.apps.googleusercontent.com',
        secret: 'F30gbFMzB3eX_1mks5tj4qdg'
    },
    port: 3000
}

module.exports = isProduction?productionConfig:devConfig