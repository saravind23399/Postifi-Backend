const handler = require('express').Router()
const comment = require('../Models/comment')
const post = require('../Models/post')

const log = require('../Lib/logger')
const config = require('../Lib/config')
const googleAuthLib = require('../Lib/googleAuth')

handler.get('/ping', (req, res) => {
    res.status(202).json({
        success: true,
        message: 'Server Live'
    })
})

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
                                    message: 'An Error occured. Try again',
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
                    log.error({ request: req, info: 'Incomplete body for new post' })
                    res.status(406).json({
                        success: false,
                        message: 'Invalid/Incomplete Values for adding a new post.',
                        debug: config.production ? null : req.body
                    })
                }
            }
        })
    }
})

handler.get('/editComment', (req, res) => {
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
                if (req.body.commentText && req.body.postId && req.body._id) {
                    post.find({ _id: req.body.postId }, (postFindError, postFindDocs) => {
                        if (postFindError) {
                            log.error({ request: req, info: 'Error while searching Post : ' + postFindError })
                            res.status(406).json({
                                success: false,
                                message: 'Error while searching Post ',
                                debug: config.production ? null : postFindError
                            })
                        } else {
                            if (postFindDocs.length == 0) {
                                log.error({ request: req, info: 'No post find found | postId : ' + req.body.postId })
                                res.status(406).json({
                                    success: false,
                                    message: 'Error while searching Post ',
                                    debug: config.production ? null : postFindDocs
                                })
                            } else {
                                comment.findByIdAndUpdate(req.body._id, {
                                    $set: {
                                        commentText: req.body.commentText
                                    }
                                }, (updateError, updateDocs) => {
                                    if (updateError) {
                                        log.error({ request: req, info: 'Cannot update comment | _id : ' + req.body._id })
                                        res.status(202).json({
                                            success: false,
                                            message: 'Error while updating Comment ',
                                            debug: config.production ? null : updateError
                                        })
                                    } else {
                                        log.info({ request: req, info: 'Comment Updated | _id : ' + req.body._id })
                                        res.status(202).json({
                                            success: true,
                                            message: 'Comment updated Successfully ',
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
                        if (postFindError) {
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

handler.post('/getUserComments', (req, res) => {
    if (req.body._id && req.body.idToken) {
        googleAuthLib.verifyGoogleIdToken(req, (tokenError, verifiedToken) => {
            if (tokenError) {
                log.error({ request: req, info: 'Unable to validate token : ' + req.body.idToken })
                res.status(406).json({
                    success: false,
                    message: 'Unable to validate user. Please login again. ',
                    debug: config.production ? null : tokenError
                })
            } else {
                post.find({ email: verifiedToken.email }, (findError, findDocs) => {
                    if (findError) {
                        log.error({ request: req, info: 'Cannot get comments for user' })
                        res.status(202).json({
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