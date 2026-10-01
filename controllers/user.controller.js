const userService = require('../services/user.service');

/**
 * 用户控制器 - 处理HTTP请求
 */
class UserController {
  /**
   * 用户注册
   */
  async register(req, res) {
    try {
      const { username, password } = req.body;

      // 基础验证
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      const user = await userService.register(username, password);
      
      res.status(201).json({
        success: true,
        message: '注册成功',
        data: user
      });
    } catch (error) {
      // 统一错误处理，不暴露具体数据库信息
      res.status(400).json({
        success: false,
        message: error.message || '注册失败'
      });
    }
  }

  /**
   * 用户登录
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      const user = await userService.login(username, password);
      
      // 设置session（简单实现）
      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({
        success: true,
        message: '登录成功',
        data: user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message || '登录失败'
      });
    }
  }

  /**
   * 退出登录
   */
  logout(req, res) {
    req.session.destroy();
    res.json({
      success: true,
      message: '已退出登录'
    });
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const user = await userService.getUserById(req.session.userId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();