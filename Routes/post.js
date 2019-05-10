const router = require('express').Router()

router.get('/ping', (req, res)=>{
    res.json({
        success: true,
        message: 'Server Live'
    })
})

module.exports = router