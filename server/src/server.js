import 'dotenv/config'
import http from 'http'
import app from './app.js'
import connectDB from './config/db.js'
import { initSocket } from './socket.js'

const PORT = process.env.PORT || 5000

const startServer = async () => {
  // Connect to MongoDB
  await connectDB()

  // Create HTTP server and attach Socket.IO
  const httpServer = http.createServer(app)
  initSocket(httpServer)

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`
  ⚡ ═══════════════════════════════════════════ ⚡
  ║                                               ║
  ║   Apna Electro API Server                     ║
  ║   Running on: http://localhost:${PORT}           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                 ║
  ║   WebSocket:   Socket.IO ✅                    ║
  ║                                               ║
  ⚡ ═══════════════════════════════════════════ ⚡
    `)
  })
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message)
  process.exit(1)
})

startServer()
