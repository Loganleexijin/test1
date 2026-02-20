/**
 * This is a API server
 */

import dotenv from 'dotenv'

// load env
dotenv.config()

import express, {
  type Request,
  type Response,
} from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import aiRoutes from './routes/ai.js'
import fastingRoutes from './routes/fasting.js'
import mealsRoutes from './routes/meals.js'
import filesRoutes from './routes/files.js'
import { sendError, sendOk } from './utils/api-response.js'

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/fasting', fastingRoutes)
app.use('/api/meals', mealsRoutes)
app.use('/api/files', filesRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    void req
    sendOk(res, { status: 'ok' }, 'ok')
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: unknown) => {
  void error
  void req
  void next
  sendError(res, 500, 'Server internal error')
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  sendError(res, 404, 'API not found')
})

export default app
