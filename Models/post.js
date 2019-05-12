const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    name: String,
    email: String,
    postTitle: String,
    postContent: String,
    postImageUrl: String,
    postHyperLinkUrl: String
}, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    })

module.exports = mongoose.model('Post', PostSchema)