const dotenv = require('dotenv')
dotenv.config()

const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')

const authRoutes       = require('./src/routes/authRoutes')
const courseRoutes     = require('./src/routes/courseRoutes')
const enrollmentRoutes = require('./src/routes/enrollmentRoutes')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

app.use('/api/auth',        authRoutes)
app.use('/api/courses',     courseRoutes)
app.use('/api/enrollments', enrollmentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'Teachify API running ✅' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Teachify server running on http://localhost:${PORT}`)
})