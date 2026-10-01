const messageService = require('../services/message.service');

/**
 * 消息控制器 - 处理HTTP请求
 */
class MessageController {
  /**
   * 获取历史消息
   */
  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const messages = await messageService.getHistoryMessages(limit, offset);
      
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 清洗消息（供WebSocket使用）
   */
  sanitizeMessage(content) {
    return messageService.sanitizeMessage(content);
  }

  /**
   * 保存消息（供WebSocket使用）
   */
  async saveMessage(userId, content) {
    return await messageService.saveMessage(userId, content);
  }
}

module.exports = new MessageController();