const User = require('../models/user.model');
const PasswordEncrypt = require('../utils/password-encrypt');
const XSSclean = require('../utils/xss-clean');

/**
 * 用户服务 - 对应论文4.2.1节
 * 处理用户相关的业务逻辑
 */
class UserService {
  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>}
   */
  async register(username, password) {
    try {
      // 1. XSS清洗用户名
      const cleanUsername = XSSclean.cleanUsername(username);
      if (!cleanUsername) {
        throw new Error('用户名包含非法字符');
      }

      // 2. 检查用户名是否已存在
      const existingUser = await User.findOne({ 
        where: { username: cleanUsername } 
      });
      
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 3. 密码加密
      const hashedPassword = await PasswordEncrypt.encrypt(password);

      // 4. 创建用户 - 参数化查询自动防SQL注入
      const newUser = await User.create({
        username: cleanUsername,
        password: hashedPassword
      });

      // 返回用户信息（不包含密码）
      return {
        id: newUser.id,
        username: newUser.username,
        created_at: newUser.created_at
      };
    } catch (error) {
      throw new Error(`注册失败: ${error.message}`);
    }
  }

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>}
   */
  async login(username, password) {
    try {
      // 1. XSS清洗
      const cleanUsername = XSSclean.cleanUsername(username);

      // 2. 查询用户 - 参数化查询
      const user = await User.findOne({ 
        where: { username: cleanUsername } 
      });

      if (!user) {
        throw new Error('用户名或密码错误');
      }

      // 3. 验证密码
      const isValid = await PasswordEncrypt.verify(password, user.password);
      if (!isValid) {
        throw new Error('用户名或密码错误');
      }

      // 返回用户信息（不包含密码）
      return {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      };
    } catch (error) {
      throw new Error(`登录失败: ${error.message}`);
    }
  }

  /**
   * 根据ID查询用户
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'created_at'] // 不返回密码
      });
      
      if (!user) {
        throw new Error('用户不存在');
      }
      
      return user;
    } catch (error) {
      throw new Error(`查询用户失败: ${error.message}`);
    }
  }
}

module.exports = new UserService();