import { Server } from 'socket.io'

let io = null

/**
 * Initialize Socket.IO and attach it to an HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {Server}
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`)

    // Client joins a room for a specific electrician to receive slot updates
    socket.on('join:electrician', (electricianId) => {
      if (!electricianId) return
      const room = `elec:${electricianId}`
      socket.join(room)
      console.log(`   └─ ${socket.id} joined room ${room}`)
    })

    // Client leaves a room
    socket.on('leave:electrician', (electricianId) => {
      if (!electricianId) return
      socket.leave(`elec:${electricianId}`)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

/**
 * Get the current Socket.IO instance.
 * @returns {Server}
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket(server) first.')
  }
  return io
}
