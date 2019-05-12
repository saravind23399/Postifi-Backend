const handler = require('express').Router()
const config = require('../Lib/config')
const log = require('../Lib/logger')

const googleAuthLib = require('../Lib/googleAuth')

handler.get('/ping', (req, res) => {
    res.status(202).json({
        success: true,
        message: 'Server Live'
    })
})

handler.post('/google/resolveToken', (req, res) => {
    googleAuthLib.verifyGoogleIdToken(req, (tokenError, verifiedToken)=>{
        if(tokenError){
            log.error({ request: req, info: 'Unable to verify Token | TokenError : ' + tokenError })
            res.status(406).json({
                success: false,
                message: 'Cannot verify Google Token. Logout and try again',
                debug: config.production?null:tokenError
            })
        } else {
            res.status(202).json({
                success: true,
                message: {
                    email: verifiedToken.email,
                    picture: verifiedToken.picture,
                    name: verifiedToken.name
                },
                debug: config.production?null:tokenError
            })
        }
    })
})

module.exports = handler