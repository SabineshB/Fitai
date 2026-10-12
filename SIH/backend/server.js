import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()
const app = express()
const port = process.env.PORT || 4000
app.use(cors())
app.use(express.json())

const users = [{ id: 'u1', name: 'Alex Kim', email: 'alex@fitai.demo', followers: 1204, following: 186 }]
const posts = [{ id: 'p1', author: 'Maya Chen', title: 'The 20 squat reset', caption: 'A quick form-first reset for your afternoon slump.', hashtags: ['#squats', '#mobility'], challenge: '20 Squats Challenge' }]
const challenges = [
  { id: 'c1', title: '20 Squats Challenge', exerciseType: 'Squat', target: '20 reps', difficulty: 'Easy', participants: 1248, system: true },
  { id: 'c2', title: 'Push-up Precision', exerciseType: 'Push-up', target: '60 sec', difficulty: 'Medium', participants: 876, system: true },
]
const scores = [{ user: 'Samira Jones', challengeId: 'c1', score: 98 }, { user: 'Maya Chen', challengeId: 'c1', score: 96 }, { user: 'Theo Wright', challengeId: 'c1', score: 94 }]

app.get('/health', (_req, res) => res.json({ ok: true, service: 'fitai-api' }))
app.post('/register', (req, res) => { const user = { id: `u${users.length + 1}`, ...req.body, followers: 0, following: 0 }; users.push(user); res.status(201).json(user) })
app.post('/login', (req, res) => { const user = users.find((item) => item.email === req.body.email) || users[0]; res.json({ user, token: 'demo-fitai-token' }) })
app.get('/posts', (_req, res) => res.json(posts))
app.post('/posts', (req, res) => { const post = { id: `p${posts.length + 1}`, ...req.body }; posts.unshift(post); res.status(201).json(post) })
app.get('/challenges', (_req, res) => res.json(challenges))
app.post('/challenges', (req, res) => { const challenge = { id: `c${challenges.length + 1}`, ...req.body, participants: 0, system: false }; challenges.unshift(challenge); res.status(201).json(challenge) })
app.get('/challenges/:id', (req, res) => { const challenge = challenges.find((item) => item.id === req.params.id); if (challenge) return res.json(challenge); return res.status(404).json({ message: 'Challenge not found' }) })
app.post('/scores', (req, res) => { const score = { id: `s${scores.length + 1}`, ...req.body }; scores.push(score); res.status(201).json(score) })
app.get('/leaderboard/:challengeId', (req, res) => res.json(scores.filter((item) => item.challengeId === req.params.challengeId).sort((a, b) => b.score - a.score)))

if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch((error) => console.error('MongoDB connection skipped:', error.message))
app.listen(port, () => console.log(`FitAI API running at http://localhost:${port}`))
