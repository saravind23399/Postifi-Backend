const mongoose = require('mongoose')

const config = require('./Lib/config')
const log = require('./Lib/logger')

const app = require('./app')

app.listen(config.port, err => {
    if (err) {
        log.fatal({ info: 'Cannot Start Server on PORT' + config.port })
    } else {
        mongoose.connect(config.dbUrl, { useNewUrlParser: true }, (dbConnectError) => {
            if (dbConnectError) {
                log.error({ info: 'Cannot Connect to DB @ ' + config.dbUrl })
            } else {
                log.info({ info: 'Server started at PORT  ' + config.port })
                log.info({ info: 'Connected to DB @ ' + config.dbUrl })
            }
        })
    }
})
