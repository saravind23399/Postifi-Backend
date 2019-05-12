const googleVerifier = require('google-id-token-verifier')
const config = require('./config')
const log = require('./logger')

module.exports = {
    verifyGoogleIdToken: (req, callback) => {
        googleVerifier.verify(req.body.idToken, config.googleOAuth.clientId, (tokenError, verifiedToken) => {
            if (tokenError) {
                log.error({ request: req, info: 'Cannot verifiy Google idToken : ' + req.body.idToken + ' | Reason : ' + tokenError })
                callback(tokenError, null)
            } else {
                log.info({ request: req, info: 'Token verified successfully : ' + req.body.idToken })
                callback(null, verifiedToken)
            }
        })
    },
}