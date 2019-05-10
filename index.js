const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const cors = require('cors')

const config = require('./Config/config')
const log = require('./Config/logger')

const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyparser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, err => {
    if(err){
        log.fatal('Cannot Start Server on PORT' + PORT)
    } else {
        mongoose.connect(config.dbUrl, {useNewUrlParser: true}, (dbConnectError)=>{
            if(dbConnectError){
                log.error('Cannot Connect to DB @ ' + config.dbUrl)
            } else {
                log.info('Server started at PORT  ' + PORT)
                log.info('Connected to DB @ ' + config.dbUrl)
            }
        })
    }
})
