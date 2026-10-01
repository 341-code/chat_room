const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

// 获取历史消息
router.get('/history', messageController.getHistory.bind(messageController));

module.exports = router;