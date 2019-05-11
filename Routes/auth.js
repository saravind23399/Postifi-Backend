const router = require('express').Router()
const googleVerifier = require('google-id-token-verifier')
const config = require('../Config/config')
const log = require('../Config/logger')

router.get('/ping', (req, res) => {
    res.json({
        success: true,
        message: 'Server Live'
    })
})

router.post('/google/resolveToken', (req, res) => {
    googleVerifier.verify(req.body.idToken, config.googleOAuth.clientId, (tokenError, verifiedToken) => {
        if (tokenError) {
            log.error('Cannot verifiy Google idToken : ' + req.body.idToken + ' | Reason : ' + tokenError)
            res.status(500).json({
                success: false,
                message: 'Cannot verify token',
                debug: config.production?null:tokenError
            })
        } else {
            log.info('Token verified successfully : ' + req.body.idToken)
            res.status(200).json({
                success: true,
                message: docs,
                debug: config.production?null:verifiedToken               
            })
        }
    })
})

module.exports = router