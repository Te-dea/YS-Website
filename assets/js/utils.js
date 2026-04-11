// 设备检测（优化：缓存结果，避免重复计算）
let deviceType = null;
function detectDevice() {
    if (deviceType) return deviceType;
    const width = window.innerWidth;
    if (width < 768) deviceType = 'mobile';
    else if (width < 1024) deviceType = 'tablet';
    else deviceType = 'desktop';
    return deviceType;
}

// 图片懒加载（升级：仅针对游戏图片，性能优化）
function initLazyLoad() {
    // 只懒加载游戏图片，减少DOM查询
    const images = document.querySelectorAll('.project-img');
    if (!images.length) return;

    const lazyLoad = (img) => {
        const src = img.getAttribute('data-src');
        if (src) {
            // 图片加载失败降级
            img.onerror = () => {
                img.src = '../assets/images/default-game.jpg'; // 默认游戏图片
            };
            img.src = src;
            img.removeAttribute('data-src');
        }
    };

    // 优先使用IntersectionObserver，性能更好
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    lazyLoad(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        images.forEach(img => observer.observe(img));
    } else {
        // 降级方案：节流滚动事件
        const lazyLoadThrottled = throttle(() => {
            images.forEach(img => {
                if (img.getBoundingClientRect().top < window.innerHeight + 100) {
                    lazyLoad(img);
                }
            });
        }, 200);
        window.addEventListener('scroll', lazyLoadThrottled);
    }
}

// 初始化工具函数（性能优化：DOMContentLoaded）
document.addEventListener('DOMContentLoaded', () => {
    initLazyLoad();
    console.log('当前设备：', detectDevice());
});

// 节流函数（通用）
function throttle(fn, delay = 200) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            fn.apply(this, args);
            lastCall = now;
        }
    };
}