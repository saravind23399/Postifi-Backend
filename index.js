const mongoose = require('mongoose')

const config = require('./Config/config')
const log = require('./Config/logger')

const app = require('./app')

app.listen(config.port, err => {
    if(err){
        log.fatal('Cannot Start Server on PORT' + config.port)
    } else {
        mongoose.connect(config.dbUrl, {useNewUrlParser: true}, (dbConnectError)=>{
            if(dbConnectError){
                log.error('Cannot Connect to DB @ ' + config.dbUrl)
            } else {
                log.info('Server started at PORT  ' + config.port)
                log.info('Connected to DB @ ' + config.dbUrl)
            }
        })
    }
})
