const Message = require('../models/message.model');
const User = require('../models/user.model');
const XSSclean = require('../utils/xss-clean');

/**
 * 消息服务 - 对应论文4.2.2节
 * 处理聊天消息相关业务逻辑
 */
class MessageService {
  /**
   * 保存消息 - 自动防SQL注入
   * @param {number} userId - 用户ID
   * @param {string} content - 消息内容
   * @returns {Promise<Object>}
   */
  async saveMessage(userId, content) {
    try {
      // 1. XSS清洗
      const safeContent = XSSclean.cleanMessage(content);
      
      if (!safeContent) {
        throw new Error('消息内容不能为空');
      }

      // 2. 保存到数据库 - 参数化查询
      const message = await Message.create({
        user_id: userId,
        content: safeContent
      });

      // 3. 关联查询用户信息
      const messageWithUser = await Message.findByPk(message.id, {
        include: [{
          model: User,
          attributes: ['id', 'username']
        }]
      });

      return {
        id: messageWithUser.id,
        content: messageWithUser.content,
        send_time: messageWithUser.send_time,
        user: {
          id: messageWithUser.User.id,
          username: messageWithUser.User.username
        }
      };
    } catch (error) {
      throw new Error(`保存消息失败: ${error.message}`);
    }
  }

  /**
   * 获取历史消息
   * @param {number} limit - 获取条数
   * @param {number} offset - 偏移量
   * @returns {Promise<Array>}
   */
  async getHistoryMessages(limit = 50, offset = 0) {
    try {
      const messages = await Message.findAll({
        include: [{
          model: User,
          attributes: ['id', 'username']
        }],
        order: [['send_time', 'DESC']],
        limit: Math.min(limit, 100), // 防止请求过大
        offset: offset
      });

      // 转换为前端需要的格式
      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        send_time: msg.send_time,
        user: {
          id: msg.User.id,
          username: msg.User.username
        }
      })).reverse(); // 按时间正序返回
    } catch (error) {
      throw new Error(`获取历史消息失败: ${error.message}`);
    }
  }

  /**
   * 清洗消息内容（供WebSocket调用）
   * @param {string} content 
   * @returns {string}
   */
  sanitizeMessage(content) {
    return XSSclean.cleanMessage(content);
  }
}

module.exports = new MessageService();