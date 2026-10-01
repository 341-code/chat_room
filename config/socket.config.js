// Socket.io 配置
const socketConfig = {
  cors: {
    origin: "http://localhost:3000", // 限制来源，防止跨站点劫持
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,  // 心跳超时时间
  pingInterval: 25000, // 心跳间隔
  transports: ['websocket'], // 强制使用WebSocket，避免轮询
  allowEIO3: true,
  maxHttpBufferSize: 1e6 // 限制消息大小，防止DoS攻击
};

module.exports = socketConfig;