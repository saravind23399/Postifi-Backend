const mongoose = require('mongoose')

const CommentSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    email: String,
    name: String,
    commentText: String,
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt' 
    }}
)

module.exports = mongoose.model('Comment', CommentSchema)