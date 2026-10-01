const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

/**
 * 用户模型 - 对应论文3.3.1节
 * 通过Sequelize模型定义实现参数化查询和输入校验
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '唯一用户ID'
  },
  username: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: '用户名不能为空' },
      len: {
        args: [3, 20],
        msg: '用户名长度必须在3-20个字符之间'
      },
      isUsernameValid(value) {
        // 只允许字母、数字、下划线、中文
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]{3,20}$/.test(value)) {
          throw new Error('用户名只能包含字母、数字、下划线或中文');
        }
      }
    },
    comment: '用户名，唯一且非空'
  },
  password: {
    type: DataTypes.STRING(60), // bcrypt加密后长度为60
    allowNull: false,
    validate: {
      notEmpty: { msg: '密码不能为空' }
    },
    comment: '加密后的密码'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '注册时间'
  }
}, {
  tableName: 'users',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['username']
    }
  ]
});

module.exports = User;