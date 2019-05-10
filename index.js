const express = require('express')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 3000

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
        console.log('Server started on port ' + PORT)
    }
})