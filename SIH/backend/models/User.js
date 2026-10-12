import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, passwordHash: String, bio: String, followers: { type: Number, default: 0 }, following: { type: Number, default: 0 }, streak: { type: Number, default: 0 } }, { timestamps: true })
export default mongoose.model('User', userSchema)
