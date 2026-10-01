const { Sequelize } = require('sequelize');

// 数据库配置 - 遵循最小权限原则
const sequelize = new Sequelize('chat_room', 'admin', 'admin123', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,        // 最大连接数
    min: 0,        // 最小连接数
    acquire: 30000, // 连接超时时间
    idle: 10000     // 空闲连接超时
    timezone:'+8:00' //东八区北京时间
  },
  logging: false,  // 关闭SQL日志，避免敏感信息泄露
  define: {
    timestamps: false, // 不使用默认时间戳
    freezeTableName: true // 禁止表名自动复数化
  }
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection
};