import mongoose from 'mongoose'
const scoreSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }, reps: Number, form: Number, accuracy: Number, speed: Number, overall: Number }, { timestamps: true })
export default mongoose.model('Score', scoreSchema)
