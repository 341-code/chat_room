require('dotenv').config(); // 从 .env 读取密钥
const CryptoJS = require('crypto-js');

/**
 * AES加密工具 - 用于消息传输加密
 * 对应论文：传输加密防护
 */
const ENV_SECRET_KEY = process.env.AES_SECRET_KEY;
if (!ENV_SECRET_KEY) {
    console.warn('[encryption] 未配置 AES_SECRET_KEY，正在使用仅供本地开发的默认密钥；请复制 .env.example 为 .env 并配置');
}
// 默认值仅用于未配置 .env 时保证项目可运行，生产环境必须通过 AES_SECRET_KEY 覆盖
const EFFECTIVE_SECRET_KEY = ENV_SECRET_KEY || 'dev-only-insecure-key';

class Encryption {
    // 密钥统一来自环境变量，源码中不再硬编码真实密钥
    static get SECRET_KEY() {
        return EFFECTIVE_SECRET_KEY;
    }

    /**
     * AES加密
     * @param {string} text - 明文消息
     * @returns {string} 密文
     */
    static encrypt(text) {
        // 处理空值
        if (text === null || text === undefined) return text;
        if (typeof text !== 'string') return text;
        if (text === '') return '';
        
        try {
            return CryptoJS.AES.encrypt(text, this.SECRET_KEY).toString();
        } catch (error) {
            console.error('加密失败:', error);
            return text;
        }
    }

    /**
     * AES解密
     * @param {string} cipherText - 密文
     * @returns {string} 明文
     */
    static decrypt(cipherText) {
        // 处理空值
        if (cipherText === null || cipherText === undefined) return cipherText;
        if (typeof cipherText !== 'string') return cipherText;
        if (cipherText === '') return '';
        
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, this.SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted || cipherText; // 如果解密失败，返回原文
        } catch (error) {
            console.error('解密失败:', error);
            return cipherText;
        }
    }
}

module.exports = Encryption;