# chat_room
基于Node.js+MySQL搭建的实时通讯聊天室，以Web安全防护为核心，重点实现对SQL注入与存储型XSS的防御，并 完成注册登录、实时聊天、非法内容过滤等业务功能。




本系统为防SQL注入与XSS攻击的Web聊天室系统，采用Node.js+Express搭建后端服务，Socket.io实现实时消息通信，MySQL作为数据库存储。系统具备用户注册登录、实时通信、消息加密传输、XSS防护、SQL注入防护等功能，整体采用MVC分层架构，结构清晰、安全性高、便于部署与维护。

开发与运行环境
一．必备软件
1.Node.js（v18.x）
自带npm，用于运行系统和安装依赖
下载：https://nodejs.org/zh-cn/
2.MySQL（8.0）
数据库服务，存储用户和聊天记录
3.Visual Studio Code
代码编辑器
二．核心技术与依赖包
后端框架：Express
实时通信：Socket.io
数据库 ORM：Sequelize
安全相关：bcrypt（密码加密）、crypto（消息加密）、DOMPurify（XSS 过滤）

代码结构说明
文件夹	说明
config	数据库、Socket 配置文件
controllers	请求控制层，处理业务逻辑
database	数据库初始化脚本 / 连接配置
models	Sequelize 数据模型（用户 / 消息表）
Node_modules	项目依赖包（自动安装）
public	前端页面（HTML/JS/CSS）
routes	路由分发层，接口路径管理
services	业务逻辑层（之前文档里合并到了 controller，你这里单独分了层，更规范）
tests	SQL 注入、XSS 攻击测试用例
utils	加密、XSS 清洗等工具函数
Package.json/package-lock.json	依赖配置文件
Server.js	项目入口文件

核心功能说明
1.用户密码加密：使用bcrypt加盐哈希，不存明文。
2.消息加密：AES-256对聊天消息加密存储与传输。
3.XSS 防御：后端用DOMPurify清洗输入，前端用textContent渲染。
4.SQL 注入防御：Sequelize参数化查询，避免拼接SQL。
5.实时聊天：Socket.io长连接，多用户在线实时通信。

系统配置与运行步骤
1.安装Node.js（默认勾选npm）
2.安装MySQL，启动服务，创建数据库（如chat_db）
3.下载项目代码
将文件夹解压到任意路径
4.安装项目依赖
5.打开cmd/VSCode终端，进入项目目录：
cd XXXX
npm install
自动安装所有依赖（express、socket.io、sequelize 等）
6.配置数据库
打开config/db.config.js，修改数据库账号密码
7.启动项目
node server.js
提示类似 Server running on port 3000 即成功 
8.访问系统
打开浏览器输入：http://localhost:3000
即可注册、登录并使用聊天室

代码特点
采用MVC架构，分层清晰、易维护
安全机制完整：密码加密、消息加密、XSS过滤、防SQL注入。
依赖管理规范，配置简单，新手也能快速部署运行。
注释清晰、代码规范，便于二次开发与扩展
