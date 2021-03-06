const handler = require('express').Router()
const comment = require('../../Models/Comment/comment')
const post = require('../../Models/Post/post')

const log = require('../../Lib/logger')
const config = require('../../Lib/config')
const googleAuthLib = require('../../Lib/googleAuth')

handler.get('/ping', (req, res) => {
    res.status(202).json({
        success: true,
        message: 'Server Live'
    })
})

/*
    **** REQUIRED VALUES IN BODY ****
    > idToken
    > postId
    > commentText
*/

handler.post('/newComment', (req, res) => {
    if (!req.body.idToken) {
        log.error({ request: req, info: 'Request without idToken' })
        res.status(406).json({
            success: false,
            message: 'User Not Authenticated. No Google idToken.'
        })
    } else {
        googleAuthLib.verifyGoogleIdToken(req, (tokenError, verifiedToken) => {
            if (tokenError) {
                res.status(406).json({
                    success: false,
                    message: 'Unable to validate user. Please login again. ',
                    debug: config.production ? null : tokenError
                })
            } else {
                if (req.body.postId && req.body.commentText) {
                    post.countDocuments({ _id: req.body.postId }, (countError, postCount) => {
                        if (countError) {
                            log.error({ request: req, info: 'Unable to add comment : ' + countError })
                            res.status(406).json({
                                success: false,
                                message: 'An Error occured. Try again',
                                debug: config.production ? null : countError
                            })
                        } else {
                            if (postCount != 1) {
                                log.error({ request: req, info: 'Unable to add comment : No Post found for id | _id : ' + req.body.postId })
                                res.status(406).json({
                                    success: false,
                                    message: 'No post found!',
                                    debug: config.production ? null : countError
                                })
                            } else {
                                const newComment = new comment({
                                    name: verifiedToken.name,
                                    email: verifiedToken.email,
                                    postId: req.body.postId,
                                    commentText: req.body.commentText
                                })
                                newComment.save((saveError, saveDocs) => {
                                    if (saveError) {
                                        log.error({ request: req, info: 'Unable to add comment : ' + saveError })
                                        res.status(406).json({
                                            success: false,
                                            message: 'An Error occured. Try again',
                                            debug: config.production ? null : saveError
                                        })
                                    } else {
                                        log.info({ request: req, info: 'New comment added | email : ' + verifiedToken.email + ' | postId : ' + req.body._id })
                                        res.status(202).json({
                                            success: true,
                                            message: 'Commented successfully!',
                                            debug: config.production ? null : saveDocs
                                        })
                                    }
                                })
                            }
                        }
                    })
                } else {
                    log.error({ request: req, info: 'Incomplete body for new comment' })
                    res.status(406).json({
                        success: false,
                        message: 'Invalid/Incomplete Values for adding a new comment.',
                        debug: config.production ? null : req.body
                    })
                }
            }
        })
    }
})

/*
    **** REQUIRED VALUES IN BODY ****
    > idToken
    > _id
    > commentText
*/
handler.post('/editComment', (req, res) => {
    if (!req.body.idToken) {
        res.status(406).json({
            success: false,
            message: 'User Not Authenticated. No Google idToken.'
        })
    } else {
        googleAuthLib.verifyGoogleIdToken(req, (tokenError, verifiedToken) => {
            if (tokenError) {
                log.error({ request: req, info: 'Unable to validate token : ' + req.body.idToken })
                res.status(406).json({
                    success: false,
                    message: 'Unable to validate user. Please login again. ',
                    debug: config.production ? null : tokenError
                })
            } else {
                if (req.body.commentText  && req.body._id) {
                    comment.countDocuments({ _id: req.body._id }).exec((countError, count) => {
                        if (countError) {
                            res.status(406).json({
                                success: false,
                                message: 'An error occured. Try again',
                                debug: config.production ? null : countError
                            })
                        } else {
                            if (count == 0) {
                                res.status(406).json({
                                    success: false,
                                    message: 'No comment found.',
                                    debug: config.production ? null : req.body
                                })
                            } else {
                                comment.findByIdAndUpdate(req.body._id, { $set: { commentText: req.body.commentText } }).exec((updateError, updateDocs) => {
                                    if (updateError) {
                                        res.status(406).json({
                                            success: false,
                                            message: 'An error occured. Try again',
                                            debug: config.production ? null : updateError
                                        })
                                    } else {
                                        res.status(202).json({
                                            success: true,
                                            message: 'Comment updated Successfully!',
                                            debug: config.production ? null : updateDocs
                                        })
                                    }
                                })
                            }
                        }
                    })
                } else {
                    log.error({ request: req, info: 'Incomplete body for editing Comment' })
                    res.status(406).json({
                        success: false,
                        message: 'Invalid/Incomplete Values for editing the Comment.',
                        debug: config.production ? null : req.body
                    })
                }
            }
        })
    }
})

/*
    **** REQUIRED VALUES IN BODY ****
    > idToken
    > _id
*/

handler.post('/deleteComment', (req, res) => {
    if (!req.body.idToken) {
        res.status(406).json({
            success: false,
            message: 'User Not Authenticated. No Google idToken.'
        })
    } else {
        googleAuthLib.verifyGoogleIdToken(req, (tokenError, verifiedToken) => {
            if (tokenError) {
                log.error({ request: req, info: 'Unable to validate token : ' + req.body.idToken })
                res.status(406).json({
                    success: false,
                    message: 'Unable to validate user. Please login again. ',
                    debug: config.production ? null : tokenError
                })
            } else {
                if (req.body._id) {
                    comment.find({ email: verifiedToken.email, _id: req.body._id }, (commentFindError, commentFindDocs) => {
                        if (commentFindError) {
                            log.error({ request: req, info: 'Error while searching Comment : ' + commentFindError })
                            res.status(406).json({
                                success: false,
                                message: 'Error while searching Comment ',
                                debug: config.production ? null : commentFindError
                            })
                        } else {
                            if (commentFindDocs.length == 0) {
                                log.error({ request: req, info: 'No Comment found | email : ' + verifiedToken.email + '| _id : ' + req.body._id })
                                res.status(406).json({
                                    success: false,
                                    message: 'Error while searching Comment ',
                                    debug: config.production ? null : commentFindDocs
                                })
                            } else {
                                comment.findByIdAndDelete(req.body._id, (deleteError, deleteDocs) => {
                                    if (deleteError) {
                                        log.error({ request: req, info: 'Cannot delete Comment | _id : ' + req.body._id })
                                        res.status(202).json({
                                            success: false,
                                            message: 'Error while deleting Comment ',
                                            debug: config.production ? null : deleteError
                                        })
                                    } else {
                                        log.info({ request: req, info: 'Comment Deleted | _id : ' + req.body._id })
                                        res.status(202).json({
                                            success: true,
                                            message: 'Comment deleted Successfully ',
                                            debug: config.production ? null : deleteDocs
                                        })
                                    }
                                })
                            }
                        }
                    })
                } else {
                    log.error({ request: req, info: 'Incomplete body for deleting Comment' })
                    res.status(406).json({
                        success: false,
                        message: 'Invalid/Incomplete Values for deleted the Comment.',
                        debug: config.production ? null : req.body
                    })
                }
            }
        })
    }
})


handler.post('/getPostComments', (req, res) => {
    if (req.body.postId && req.body.idToken) {
        googleAuthLib.verifyGoogleIdToken(req, (tokenError, verifiedToken) => {
            if (tokenError) {
                log.error({ request: req, info: 'Unable to validate token : ' + req.body.idToken })
                res.status(406).json({
                    success: false,
                    message: 'Unable to validate user. Please login again. ',
                    debug: config.production ? null : tokenError
                })
            } else {
                comment.find({postId: req.body.postId}, (findError, findDocs) => {
                    if (findError) {
                        log.error({ request: req, info: 'Cannot get comments for the post' })
                        res.status(406).json({
                            success: false,
                            message: 'Error while getting Comments ',
                            debug: config.production ? null : findError
                        })
                    } else {
                        res.status(202).json({
                            success: true,
                            message: findDocs
                        })
                    }
                })
            }
        })
    } else {
        log.error({ request: req, info: 'Incomplete body for getting Comments' })
        res.status(406).json({
            success: false,
            message: 'Invalid/Incomplete Values for getting Comments.',
            debug: config.production ? null : req.body
        })
    }
})

module.exports = handler