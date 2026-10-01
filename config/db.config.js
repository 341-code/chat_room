require('dotenv').config(); // 统一从 .env 读取配置，源码中不出现任何账号口令
const { Sequelize } = require('sequelize');

// 数据库配置 - 遵循最小权限原则：账号口令全部来自环境变量
const DB_NAME = process.env.DB_NAME || 'chat_room';
const DB_USER = process.env.DB_USER || 'admin';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || 'localhost';

if (DB_PASSWORD === undefined) {
  console.warn('[db.config] 未检测到 DB_PASSWORD，请复制 .env.example 为 .env 并填写数据库口令');
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  timezone: '+08:00', // 东八区北京时间（原写法误放在 pool 内，Sequelize 不会生效）
  pool: {
    max: 5,          // 最大连接数
    min: 0,          // 最小连接数
    acquire: 30000,  // 连接超时时间
    idle: 10000      // 空闲连接超时
  },
  logging: false,  // 关闭SQL日志，避免敏感信息泄露
  define: {
    timestamps: false,     // 不使用默认时间戳
    freezeTableName: true  // 禁止表名自动复数化
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
