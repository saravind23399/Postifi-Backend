const handler = require('express').Router()
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
    > postTitle
    > postContent
    > postImageUrl
    > postHyperLinkUrl
*/

handler.post('/newPost', (req, res) => {
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
                    message: 'Unable to validate user. Please login again.',
                    debug: config.production ? null : tokenError
                })
            } else {
                if (req.body.postTitle && req.body.postContent && req.body.postImageUrl && req.body.postHyperLinkUrl) {
                    const newPost = new post({
                        name: verifiedToken.name,
                        email: verifiedToken.email,
                        postTitle: req.body.postTitle,
                        postContent: req.body.postContent,
                        postImageUrl: req.body.postImageUrl,
                        postHyperLinkUrl: req.body.postHyperLinkUrl
                    })
                    newPost.save((saveError, saveDocs) => {
                        if (saveError) {
                            log.error({ request: req, info: 'Unable to save post : ' + saveError })
                            res.status(406).json({
                                success: false,
                                message: 'An Error occured. Try again',
                                debug: config.production ? null : saveError
                            })
                        } else {
                            log.info({ request: req, info: 'New post added | Title : ' + req.body.postTitle + ' by ' + verifiedToken.email })
                            res.status(202).json({
                                success: true,
                                message: 'Posted successfully!',
                                debug: config.production ? null : saveDocs
                            })
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

/*
    **** REQUIRED VALUES IN BODY ****
    > idToken
    > _id
    > postTitle
    > postContent
    > postImageUrl
    > postHyperLinkUrl
*/

handler.post('/editPost', (req, res) => {
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
                    message: 'Unable to validate user. Please login again.',
                    debug: config.production ? null : tokenError
                })
            } else {
                if (req.body.postTitle && req.body.postContent && req.body.postImageUrl && req.body.postHyperLinkUrl && req.body._id) {
                    post.find({_id: req.body._id, email: verifiedToken.email }, (postFindError, postFindDocs) => {
                        if (postFindError) {
                            log.error({ request: req, info: 'Error while searching Post : ' + postFindError })
                            res.status(406).json({
                                success: false,
                                message: 'Error while searching Post ',
                                debug: config.production ? null : postFindError
                            })
                        } else {
                            if (postFindDocs.length == 0) {
                                log.error({ request: req, info: 'No post find found | email : ' + req.body.email + '| _id : ' + req.body._id })
                                res.status(406).json({
                                    success: false,
                                    message: 'No Post found',
                                    debug: config.production ? null : postFindDocs
                                })
                            } else {
                                post.findByIdAndUpdate(req.body._id, {
                                    $set: {
                                        postTitle: req.body.postTitle,
                                        postContent: req.body.postContent,
                                        postImageUrl: req.body.postImageUrl,
                                        postHyperLinkUrl: req.body.postHyperLinkUrl
                                    }
                                }, (updateError, updateDocs) => {
                                    if (updateError) {
                                        log.error({ request: req, info: 'Cannot update post | _id : ' + req.body._id })
                                        res.status(406).json({
                                            success: false,
                                            message: 'Error while updating Post ',
                                            debug: config.production ? null : updateError
                                        })
                                    } else {
                                        log.info({ request: req, info: 'Post Updated | _id : ' + req.body._id })
                                        res.status(202).json({
                                            success: true,
                                            message: 'Post updated Successfully',
                                            debug: config.production ? null : updateDocs
                                        })
                                    }
                                })
                            }
                        }
                    })
                } else {
                    log.error({ request: req, info: 'Incomplete body for editing post' })
                    res.status(406).json({
                        success: false,
                        message: 'Invalid/Incomplete Values for editing the post.',
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

handler.post('/deletePost', (req, res) => {
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
                if (req.body._id) {
                    post.find({ email: verifiedToken.email, _id: req.body._id }, (postFindError, postFindDocs) => {
                        if (postFindError) {
                            log.error({ request: req, info: 'Error while searching Post : ' + postFindError })
                            res.status(406).json({
                                success: false,
                                message: 'Error while searching Post ',
                                debug: config.production ? null : postFindError
                            })
                        } else {
                            if (postFindDocs.length == 0) {
                                log.error({ request: req, info: 'No post find found | email : ' + verifiedToken.email + '| _id : ' + req.body._id })
                                res.status(406).json({
                                    success: false,
                                    message: 'No Post found',
                                    debug: config.production ? null : postFindDocs
                                })
                            } else {
                                post.findByIdAndDelete(req.body._id, (deleteError, deleteDocs) => {
                                    if (deleteError) {
                                        log.error({ request: req, info: 'Cannot delete post | _id : ' + req.body._id })
                                        res.status(202).json({
                                            success: false,
                                            message: 'Error while deleting Post ',
                                            debug: config.production ? null : deleteError
                                        })
                                    } else {
                                        log.info({ request: req, info: 'Post Deleted | _id : ' + req.body._id })
                                        res.status(202).json({
                                            success: true,
                                            message: 'Post deleted Successfully',
                                            debug: config.production ? null : deleteDocs
                                        })
                                    }
                                })
                            }
                        }
                    })
                } else {
                    log.error({ request: req, info: 'Incomplete body for deleting post' })
                    res.status(406).json({
                        success: false,
                        message: 'Invalid/Incomplete Values for deleting the post.',
                        debug: config.production ? null : req.body
                    })
                }
            }
        })
    }
})

handler.get('/getAllPosts', (req, res) => {
    post.find({}).sort({ updatedAt: -1 }).exec((findError, findDocs) => {
        if (findError) {
            log.error({ request: req, info: 'Error while getting all posts' })
            res.status(406).json({
                success: false,
                message: 'Database Error. Try again',
                debug: config.production ? null : findError
            })
        } else {
            res.status(202).json({
                success: true,
                message: findDocs
            })
        }
    })
})

/*
    **** REQUIRED VALUES IN BODY ****
    > _id
*/
handler.post('/getPost', (req, res) => {
    if (req.body._id) {
        post.findById(req.body._id, (findError, findDocs) => {
            if (findError) {
                log.error({ request: req, info: 'Error while getting post : ' + req.body._id })
                res.status(406).json({
                    success: false,
                    message: 'Error while getting post',
                    debug: findError
                })
            } else {
                res.status(202).json({
                    success: true,
                    message: findDocs,
                    debug: findError
                })
            }
        })
    } else {
        log.error({ request: req, info: 'Error while getting all posts' })
        res.status(406).json({
            success: false,
            message: 'No post id provided',
            debug: req.body
        })
    }
})

module.exports = handler