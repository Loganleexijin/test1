/**
 * This is a API server
 */

import dotenv from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

// load env - 按优先级加载: .env.local > .env
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
  console.log('Loaded .env.local')
} else if (existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('Loaded .env')
} else {
  dotenv.config()
  console.log('Loaded default .env')
}

// 验证必要的环境变量
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
const missingVars = requiredEnvVars.filter(v => !process.env[v])
if (missingVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingVars.join(', '))
  console.warn('Auth and database features may not work correctly')
}

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
  void next
  
  // 详细错误日志
  console.error('❌ Server Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? 'Bearer ***' : undefined,
      'content-type': req.headers['content-type'],
    },
    timestamp: new Date().toISOString()
  })
  
  // 根据错误类型返回不同的错误码
  if (error.message?.includes('Supabase env is not configured')) {
    sendError(res, 503, 'Service unavailable: Database not configured', 'DB_NOT_CONFIGURED')
    return
  }
  
  if (error.message?.includes('connect') || error.message?.includes('ECONNREFUSED')) {
    sendError(res, 503, 'Service unavailable: Connection failed', 'CONNECTION_ERROR')
    return
  }
  
  sendError(res, 500, 'Server internal error', 'INTERNAL_ERROR')
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  sendError(res, 404, 'API not found')
})

export default app
