const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');
const User = require('./user.model');

/**
 * 消息模型 - 对应论文3.3.2节
 * 存储清洗后的安全消息内容
 */
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '唯一消息ID'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    validate: {
      isInt: { msg: '用户ID必须是整数' }
    },
    comment: '发送者ID，关联用户表'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: '消息内容不能为空' },
      len: {
        args: [1, 1000],
        msg: '消息长度不能超过1000个字符'
      }
    },
    comment: '聊天消息内容，后端清洗后的安全内容'
  },
  send_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '消息发送时间'
  }
}, {
  tableName: 'messages',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['send_time']
    }
  ]
});

// 建立关联关系
User.hasMany(Message, { foreignKey: 'user_id' });
Message.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Message;