const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// 创建纯净的DOM环境
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * XSS清洗工具 - 对应论文2.2.2节
 * 后端输入清洗，过滤所有恶意脚本
 */
class XSSClean {
    /**
     * 清洗消息内容 - 严格模式
     * @param {string} content - 用户输入内容
     * @returns {string} 清洗后的安全内容
     */
    static cleanMessage(content) {
        if (!content || typeof content !== 'string') return '';

        // 严格模式：禁用所有HTML标签和属性，只保留纯文本
        return purify.sanitize(content, {
            ALLOWED_TAGS: [],    // 禁用所有HTML标签
            ALLOWED_ATTR: [],    // 禁用所有属性
            FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
            FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
            ALLOW_DATA_ATTR: false,
            USE_PROFILES: { html: false },
            KEEP_CONTENT: false  // 不保留内容，完全删除
        }).trim();
    }

    /**
     * 清洗用户名 - 宽松模式
     * @param {string} username 
     * @returns {string}
     */
    static cleanUsername(username) {
        if (!username || typeof username !== 'string') return '';

        // 先移除HTML标签
        let cleaned = username.replace(/<[^>]*>/g, '');
        // 再移除特殊字符，但保留字母、数字、下划线、中文
        cleaned = cleaned.replace(/[^\w\u4e00-\u9fa5]/g, '');
        return cleaned.substring(0, 20);
    }

    /**
     * 检测是否包含XSS攻击特征
     * @param {string} content 
     * @returns {boolean}
     */
    static hasXSSRisk(content) {
        if (!content || typeof content !== 'string') return false;

        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /onerror\s*=/gi,
            /onclick\s*=/gi,
            /onload\s*=/gi,
            /eval\s*\(/gi,
            /document\.cookie/gi,
            /window\.location/gi
        ];

        return xssPatterns.some(pattern => pattern.test(content));
    }
}

module.exports = XSSClean;