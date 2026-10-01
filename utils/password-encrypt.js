const bcrypt = require('bcryptjs');

/**
 * 密码加密工具 - 安全存储用户密码
 */
class PasswordEncrypt {
  // 加密轮数，越高越安全但性能越低
  static SALT_ROUNDS = 10;

  /**
   * 加密密码
   * @param {string} password - 原始密码
   * @returns {Promise<string>} 加密后的哈希
   */
  static async encrypt(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('密码不能为空');
    }
    
    // 密码复杂度验证
    if (password.length < 6 || password.length > 20) {
      throw new Error('密码长度必须在6-20位之间');
    }
    
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  }

  /**
   * 验证密码
   * @param {string} password - 原始密码
   * @param {string} hash - 存储的哈希
   * @returns {Promise<boolean>}
   */
  static async verify(password, hash) {
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
  }
}

module.exports = PasswordEncrypt;