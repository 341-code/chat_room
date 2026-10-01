const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// 用户注册
router.post('/register', userController.register.bind(userController));

// 用户登录
router.post('/login', userController.login.bind(userController));

// 退出登录
router.post('/logout', userController.logout.bind(userController));

// 获取当前用户信息
router.get('/current', userController.getCurrentUser.bind(userController));

module.exports = router;