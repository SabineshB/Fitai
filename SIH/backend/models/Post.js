import mongoose from 'mongoose'
const postSchema = new mongoose.Schema({ author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, title: String, caption: String, mediaUrl: String, hashtags: [String], challenge: String, likes: { type: Number, default: 0 }, comments: { type: Number, default: 0 } }, { timestamps: true })
export default mongoose.model('Post', postSchema)
