// 1. XSS攻击防护：输入/输出转义
function escapeXSS(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
}

// 2. CSRF防护：生成并验证Token（前端侧）
function generateCSRFToken() {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // 存储到localStorage，后端可验证
    localStorage.setItem('csrf_token', token);
    return token;
}

// 验证CSRF Token
function validateCSRFToken(token) {
    const storedToken = localStorage.getItem('csrf_token');
    return token === storedToken;
}

// 3. 防止表单重复提交
let formSubmitting = false;
function preventDuplicateSubmit(form) {
    form.addEventListener('submit', (e) => {
        if (formSubmitting) {
            e.preventDefault();
            alert('请勿重复提交！');
            return;
        }
        formSubmitting = true;
        // 提交后3秒解锁（可根据实际调整）
        setTimeout(() => {
            formSubmitting = false;
        }, 3000);
    });
}

// 4. 检测并拦截可疑请求（简单版，可拓展）
function interceptSuspiciousRequests() {
    // 重写fetch，过滤可疑URL/参数
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // 过滤非法URL（示例：禁止访问外部恶意域名）
        const suspiciousDomains = ['malicious.com', 'hack.example'];
        const isSuspicious = suspiciousDomains.some(domain => url.includes(domain));
        if (isSuspicious) {
            console.warn('拦截到可疑请求：', url);
            return Promise.reject(new Error('可疑请求已拦截'));
        }
        
        // 给请求添加CSRF Token
        if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase())) {
            options.headers = {
                ...options.headers,
                'X-CSRF-Token': localStorage.getItem('csrf_token') || generateCSRFToken()
            };
        }
        
        return originalFetch.apply(this, [url, options]);
    };
}

// 初始化安全措施
document.addEventListener('DOMContentLoaded', () => {
    generateCSRFToken(); // 初始化CSRF Token
    interceptSuspiciousRequests(); // 启动请求拦截
    // 对所有表单添加防重复提交
    document.querySelectorAll('form').forEach(form => {
        preventDuplicateSubmit(form);
    });
    // 对所有用户输入框添加XSS转义
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = escapeXSS(e.target.value);
        });
    });
});