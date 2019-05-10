const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    email: String,
    postTitle: String,
    postContent: String,
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt' 
    }
)

export mongoose.model('Post', PostSchema)