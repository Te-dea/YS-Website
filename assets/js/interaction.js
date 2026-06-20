// 节流函数（性能优化）
function throttle(fn, delay = 300) {
    let timer = null;
    return function(...args) {
        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this, args);
                timer = null;
            }, delay);
        }
    };
}

// 滚动动效（升级：stagger延迟，更灵动）
function addScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 不同卡片延迟入场，更有节奏感
                entry.target.style.animationDelay = `${index * 0.2}s`;
                entry.target.classList.add('animate-fade-in', 'animate-scale-in');
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // 提前触发，提升体验
    });

    // 监听项目卡片
    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });
}

// 移动端导航折叠（优化性能，减少DOM操作）
function initMobileNav() {
    const width = window.innerWidth;
    const isMobile = width < 768;
    const navList = document.querySelector('.nav-list');
    if (!navList) return; // 避免DOM查询失败
    
    if (isMobile) {
        navList.style.maxHeight = '220px';
        navList.style.overflow = 'hidden';
        navList.style.justifyContent = 'center';
    } else {
        // 恢复默认样式，避免移动端样式残留
        navList.style.maxHeight = 'unset';
        navList.style.overflow = 'unset';
        navList.style.justifyContent = 'flex-end';
    }
}

// 初始化交互（性能优化：DOMContentLoaded改为load，避免阻塞）
window.addEventListener('load', () => {
    addScrollAnimation();
    initMobileNav();
    // 节流resize事件，减少性能消耗
    window.addEventListener('resize', throttle(initMobileNav));
});