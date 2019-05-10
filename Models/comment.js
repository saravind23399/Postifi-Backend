const mongoose = require('mongoose')

const CommentSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    email: String,
    commentText: String,
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt' 
    }
)

export mongoose.model('Comment', CommentSchema)