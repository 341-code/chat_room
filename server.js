const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { sequelize, testConnection } = require('./config/db.config');
const socketConfig = require('./config/socket.config');
const userRoutes = require('./routes/user.routes');
const messageRoutes = require('./routes/message.routes');
const messageController = require('./controllers/message.controller');
const Encryption = require('./utils/encryption'); // 新增

// 初始化Express应用
const app = express();
const server = http.createServer(app);
const io = new Server(server, socketConfig);

// 在线用户存储
const activeUsers = new Map(); // username -> Set(socket.id)

// 中间件配置
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Session配置（密钥来自 .env，dotenv 已在 config/db.config.js 中加载）
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// 路由注册
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});

// WebSocket连接处理
io.on('connection', (socket) => {
    console.log('🔌 新客户端连接，ID:', socket.id);
    
    // 每个连接都是全新的，不保留任何默认用户
    socket.userId = null;
    socket.username = null;

    // 用户身份绑定
    socket.on('bindUser', (data) => {
        const { userId, username } = data;
        
        if (!userId || !username) {
            socket.emit('error', { message: '用户ID和用户名不能为空' });
            return;
        }

        // 绑定用户信息
        socket.userId = userId;
        socket.username = username;
        
        // 存储用户连接（使用Set存储多个socket.id）
        if (!activeUsers.has(username)) {
            activeUsers.set(username, new Set());
        }
        activeUsers.get(username).add(socket.id);
        
        console.log(`用户 ${username} (ID: ${userId}) 绑定成功，当前连接数: ${activeUsers.get(username).size}`);
        console.log(`当前在线用户: ${Array.from(activeUsers.keys()).join(', ') || '无'}`);
        
        socket.emit('bindSuccess', { 
            message: '用户绑定成功',
            username: username 
        });

        // 广播在线用户列表（只发用户名列表，不发连接数）
        io.emit('onlineUsers', Array.from(activeUsers.keys()));
    });

    // 处理聊天消息
    socket.on('chat', async (data) => {
        try {
            const { content } = data;

            // 验证用户是否已登录
            if (!socket.userId || !socket.username) {
                socket.emit('error', { message: '请先登录后再发送消息' });
                return;
            }

            // XSS防护：清洗消息内容
            const safeContent = messageController.sanitizeMessage(content);
            
            if (!safeContent) {
                socket.emit('error', { message: '消息内容不能为空' });
                return;
            }

            // AES加密：对清洗后的内容进行加密传输
            const encryptedContent = Encryption.encrypt(safeContent);

            // 保存消息到数据库（保存明文，因为数据库是安全的）
            const savedMessage = await messageController.saveMessage(
                socket.userId, 
                safeContent
            );

            // 构建广播消息
            const broadcastMessage = {
                type: 'chat',
                id: savedMessage.id,
                content: encryptedContent, // 发送密文
                send_time: savedMessage.send_time,
                user: {
                    id: socket.userId,
                    username: socket.username
                }
            };

            // 广播给所有在线客户端
            io.emit('chat', broadcastMessage);
            console.log(`用户 ${socket.username} 发送消息: ${safeContent.substring(0, 20)}... (已加密)`);
        } catch (error) {
            console.error('消息处理失败:', error);
            socket.emit('error', { message: '消息发送失败' });
        }
    });

    // 处理断开连接
    socket.on('disconnect', () => {
        if (socket.username) {
            const userSockets = activeUsers.get(socket.username);
            if (userSockets) {
                userSockets.delete(socket.id);
                console.log(`用户 ${socket.username} 断开一个连接，剩余连接数: ${userSockets.size}`);
                
                // 如果该用户没有任何连接了，从在线列表移除
                if (userSockets.size === 0) {
                    activeUsers.delete(socket.username);
                    console.log(`用户 ${socket.username} 已完全离线`);
                }
                
                // 广播更新后的在线用户列表
                io.emit('onlineUsers', Array.from(activeUsers.keys()));
            }
        } else {
            console.log(`🔌 匿名用户断开连接`);
        }
    });

    // 处理错误
    socket.on('error', (error) => {
        console.error(`WebSocket错误:`, error);
    });
});

// 初始化数据库并启动服务器
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await testConnection();
        await sequelize.sync({ alter: false });
        console.log('数据库模型同步成功');

        server.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('服务器启动成功！');
            console.log('='.repeat(50));
            console.log(`访问地址: http://localhost:${PORT}`);
            //console.log(`💬 聊天室: http://localhost:${PORT}`);
            console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
            console.log('='.repeat(50) + '\n');
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
};

// 修改启动方式，方便测试
if (require.main === module) {
    startServer();
} else {
    module.exports = app;
}