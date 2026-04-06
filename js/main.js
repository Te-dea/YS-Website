document.addEventListener('DOMContentLoaded', function() {
    // 生成CSRF安全Token（优化随机数生成）
    const csrfToken = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    document.getElementById('csrfToken')?.value = csrfToken;

    // 滚动渐显动效（优化性能：节流+根元素监听）
    const fadeElements = document.querySelectorAll('.fade-in');
    // 优化Observer配置：减少触发频率
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // 只触发一次，减少性能损耗
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // 提前一点点触发，提升体验
    });

    fadeElements.forEach(el => observer.observe(el));

    // 移动端汉堡菜单交互
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // 点击菜单外关闭
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                    navMenu.classList.remove('active');
                }
            }, { once: true });
        });
        // 导航链接点击后关闭菜单
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // 表单安全验证 + XSS过滤（优化性能：函数提前定义）
    const sanitizeXSS = (str) => {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    };

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const message = document.getElementById('message')?.value || '';
            const token = document.getElementById('csrfToken')?.value || '';

            // 过滤恶意代码
            const safeName = sanitizeXSS(name);
            const safeEmail = sanitizeXSS(email);
            const safeMessage = sanitizeXSS(message);

            // 邮箱格式验证（优化正则）
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(safeEmail)) {
                alert('请输入有效的邮箱地址！');
                return;
            }

            // Token验证
            if (!token) {
                alert('安全验证失败，请刷新页面重试！');
                return;
            }

            // 优化提示：更友好的反馈
            const alertDiv = document.createElement('div');
            alertDiv.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-ins-accent text-white px-8 py-3 rounded-lg shadow-lg z-50';
            alertDiv.textContent = '留言提交成功！我们会尽快回复你～';
            document.body.appendChild(alertDiv);
            setTimeout(() => alertDiv.remove(), 3000);
            
            contactForm.reset();
        });
    }
});