const CryptoJS = require('crypto-js');

/**
 * AES加密工具 - 用于消息传输加密
 * 对应论文：传输加密防护
 */
class Encryption {
    // 密钥（实际应用中应从环境变量读取）
    static SECRET_KEY = 'chat-room-secret-key-2026';

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