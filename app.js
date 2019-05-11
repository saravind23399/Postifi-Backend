const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')

const config = require('./Config/config')
const log = require('./Config/logger')

const authRoute = require('./Routes/auth')

const app = express()
app.use(cors({origin: 'http://localhost:4200'}))

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));

app.use('/auth', authRoute)

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server Live!'
    })
})

module.exports = app
