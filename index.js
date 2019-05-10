const express = require('express')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 3000

const config = require('./Config/config')

app.get('', (req, res)=>{
    res.status(500).json({
        success: true,
        message:'Hello World!'
    })
})

app.listen(PORT, err => {
    if(err){
        console.log('Cannot Start Server on PORT')
    } else {
        mongoose.connect(config.dbUrl, {useNewUrlParser: true}, (dbConnectError)=>{
            if(dbConnectError){
                console.log('Cannot Connect to DB @ ' + config.dbUrl)
            } else {
                console.log('Server started at PORT  ' + PORT)
                console.log('Connected to DB @ ' + config.dbUrl)
            }
        })
    }
})