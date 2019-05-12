const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')

const config = require('./Lib/config')
const log = require('./Lib/logger')

const authRoute = require('./Routes/Auth/auth')
const postRoute = require('./Routes/Post/post')
const commentRoute = require('./Routes/Comment/comment')

const app = express()

app.use(cors({origin: 'http://localhost:4200'}))

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));

app.use('/auth', authRoute)
app.use('/post', postRoute)
app.use('/comment', commentRoute)

app.get('/', (req, res) => {
    res.status(202).json({
        success: true,
        message: 'Server Live!'
    })
})

module.exports = app
