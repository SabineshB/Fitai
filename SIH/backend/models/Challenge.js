import mongoose from 'mongoose'
const challengeSchema = new mongoose.Schema({ creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, title: { type: String, required: true }, exerciseType: { type: String, enum: ['Squat', 'Push-up', 'Jumping Jack'] }, target: String, description: String, difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] }, demoVideoUrl: String, system: { type: Boolean, default: false }, participants: { type: Number, default: 0 } }, { timestamps: true })
export default mongoose.model('Challenge', challengeSchema)
