// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // ====================== 元素获取 ======================
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const themeToggle = document.getElementById('themeToggle');
    const fadeSections = document.querySelectorAll('.fade-section');
    const cursor = document.querySelector('.custom-cursor');
    const heroBg = document.querySelector('.hero-bg');

    // ====================== 暗黑模式切换 ======================
    // 初始化主题（读取本地存储）
    function initTheme() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }
    initTheme();

    // 切换主题
    themeToggle.addEventListener('click', function() {
        // 旋转动画
        this.classList.add('rotate');
        setTimeout(() => this.classList.remove('rotate'), 300);
        
        // 切换暗黑类
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
    });

    // ====================== 导航栏滚动效果 ======================
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ====================== 移动端汉堡菜单 ======================
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // 点击导航链接关闭菜单
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // ====================== 滚动淡入上滑动画 ======================
    function checkFade() {
        fadeSections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (sectionTop < windowHeight * 0.85) {
                section.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', checkFade);
    checkFade(); // 初始检查

    // ====================== Hero视差滚动 ======================
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    });

    // ====================== 自定义光标跟随 ======================
    window.addEventListener('mousemove', function(e) {
        if (window.innerWidth >= 1024) {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        }
    });

    // ====================== 锚点平滑滚动 ======================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ====================== 性能优化版：丝滑收束消散 双主题鼠标拖尾 ======================
(function() {
    'use strict';

    const isMobile = window.innerWidth < 1024 || matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    class OptimizedCursorTrail {
        constructor() {
            // 双主题视觉参数（完全保留原规格）
            this.themeParams = {
                light: { totalNodes: 20, baseSize: 8, minSize: 2, baseOpacity: 0.45, ease: 0.15 },
                dark: { totalNodes: 24, baseSize: 25, minSize: 4, baseOpacity: 0.35, ease: 0.15 }
            };

            // 状态缓存
            this.currentTheme = localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light';
            this.params = this.themeParams[this.currentTheme];
            this.activeNodes = this.params.totalNodes;
            
            // DOM与坐标预缓存
            this.trailDots = [];
            this.positions = [];
            this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this.lastRenderPos = { x: 0, y: 0 };
            
            // 渲染控制
            this.isTicking = false;
            this.isPageVisible = true;
            this.isHovering = false;
            this.isScrolling = false;
            
            // ========== 新增：丝滑收束消散相关状态 ==========
            this.isFading = false;          // 是否处于收束消散阶段
            this.fadeTargetPos = { x: 0, y: 0 }; // 消散时的固定汇聚点
            this.fadeStartTime = 0;         // 消散开始时间戳
            this.fadeDuration = 1200;       // 收束+淡出总时长（毫秒，与原版一致）
            
            // 定时器与动画句柄
            this.rafId = null;
            this.hideTimer = null;
            this.scrollTimer = null;
            
            // 帧率检测与自适应降级
            this.lastFrameTime = performance.now();
            this.fps = 60;
            this.lowFpsCount = 0;
            this.fpsRecoveryCount = 0;
            this.frameSkip = 0;

            this.init();
            this.watchThemeChange();
            this.watchScroll();
        }

        init() {
            this.createNodePool();
            this.bindEvents();
            this.startRenderLoop();
        }

        // 节点池一次性创建，全程复用
        createNodePool() {
            const fragment = document.createDocumentFragment();
            const maxNodes = Math.max(this.themeParams.light.totalNodes, this.themeParams.dark.totalNodes);
            
            for (let i = 0; i < maxNodes; i++) {
                const dot = document.createElement('div');
                dot.className = 'trail-dot';
                fragment.appendChild(dot);
                this.trailDots.push(dot);
                this.positions.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }
            document.body.appendChild(fragment);
            this.updateNodeVisibility();
        }

        // 所有事件添加passive，解除浏览器阻塞
        bindEvents() {
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
                // 移动时立刻终止消散状态，恢复正常跟随
                this.cancelFade();
                this.requestRender();
            }, { passive: true });

            // 点击涟漪（完全保留原效果）
            window.addEventListener('mousedown', (e) => {
                this.createRipple(e.clientX, e.clientY);
            }, { passive: true });

            // 可点击元素悬停检测
            document.addEventListener('mouseover', (e) => {
                const target = e.target.closest('a, button, .work-card, .nav-link, .btn, .theme-toggle, .hamburger');
                this.isHovering = !!target;
                this.trailDots.forEach(dot => dot.classList.toggle('trail-hover', this.isHovering));
            });

            // 页面后台暂停RAF
            document.addEventListener('visibilitychange', () => {
                this.isPageVisible = !document.hidden;
                if (this.isPageVisible) {
                    this.lastFrameTime = performance.now();
                    this.startRenderLoop();
                } else {
                    this.stopRenderLoop();
                }
            });
        }

        // 滚动场景降级
        watchScroll() {
            window.addEventListener('scroll', () => {
                this.isScrolling = true;
                clearTimeout(this.scrollTimer);
                this.scrollTimer = setTimeout(() => {
                    this.isScrolling = false;
                }, 100);
            }, { passive: true });
        }

        // ticking节流锁：单例RAF，每帧仅渲染一次
        requestRender() {
            if (!this.isTicking && this.isPageVisible) {
                this.isTicking = true;
                this.rafId = requestAnimationFrame((time) => this.render(time));
            }
        }

        startRenderLoop() {
            if (this.rafId) return;
            this.lastFrameTime = performance.now();
            this.rafId = requestAnimationFrame((time) => this.render(time));
        }

        stopRenderLoop() {
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            this.isTicking = false;
        }

        // ========== 核心修改：收束消散逻辑 ==========
        // 取消消散（鼠标再次移动时调用）
        cancelFade() {
            clearTimeout(this.hideTimer);
            this.isFading = false;
            // 重置所有节点透明度，恢复正常显示
            for (let i = 0; i < this.activeNodes; i++) {
                this.trailDots[i].style.opacity = '';
            }
            // 启动停止检测定时器
            this.hideTimer = setTimeout(() => {
                this.startFade();
            }, 80); // 停止移动80ms后进入收束消散，避免微动触发
        }

        // 开始收束消散
        startFade() {
            this.isFading = true;
            this.fadeTargetPos.x = this.mouse.x;
            this.fadeTargetPos.y = this.mouse.y;
            this.fadeStartTime = performance.now();
            this.requestRender(); // 确保动画继续运行
        }

        // 核心渲染函数
        render(timestamp) {
            this.isTicking = false;

            // 1. 帧率检测
            const delta = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;
            this.detectFps(delta);

            // 2. 滚动期间降帧
            if (this.isScrolling) {
                this.frameSkip++;
                if (this.frameSkip < 2) {
                    this.requestRender();
                    return;
                }
                this.frameSkip = 0;
            }

            // 3. 正常移动状态下，坐标变化过小则跳过渲染
            if (!this.isFading) {
                const dx = this.mouse.x - this.lastRenderPos.x;
                const dy = this.mouse.y - this.lastRenderPos.y;
                if (Math.sqrt(dx * dx + dy * dy) < 2) {
                    return;
                }
                this.lastRenderPos.x = this.mouse.x;
                this.lastRenderPos.y = this.mouse.y;
            }

            // 4. 计算目标点与淡出系数
            let targetX, targetY, fadeMultiplier = 1;
            
            if (this.isFading) {
                // 消散阶段：目标点固定为停止位置，计算淡出系数
                targetX = this.fadeTargetPos.x;
                targetY = this.fadeTargetPos.y;
                const elapsed = timestamp - this.fadeStartTime;
                const progress = Math.min(elapsed / this.fadeDuration, 1);
                fadeMultiplier = 1 - progress;

                // 消散完成：结束动画
                if (progress >= 1) {
                    this.isFading = false;
                    for (let i = 0; i < this.activeNodes; i++) {
                        this.trailDots[i].style.opacity = 0;
                    }
                    return;
                }
            } else {
                // 正常跟随阶段：目标点为实时鼠标坐标
                targetX = this.mouse.x;
                targetY = this.mouse.y;
            }

            // 5. 批量更新所有节点位置、尺寸、透明度
            const { totalNodes, baseSize, minSize, baseOpacity, ease } = this.params;
            const activeCount = this.activeNodes;

            for (let i = 0; i < activeCount; i++) {
                // LERP线性插值缓动（消散阶段也持续缓动，实现自然收束）
                this.positions[i].x += (targetX - this.positions[i].x) * ease;
                this.positions[i].y += (targetY - this.positions[i].y) * ease;

                // 尺寸用scale实现，零布局抖动
                const sizeProgress = i / activeCount;
                const scale = 1 - (1 - minSize / baseSize) * sizeProgress;
                
                // 基础透明度指数衰减 + 淡出系数
                const opacity = baseOpacity * Math.pow(0.85, i) * fadeMultiplier;

                // 纯translate3d+scale，完全GPU合成
                this.trailDots[i].style.transform = 
                    `translate3d(${this.positions[i].x}px, ${this.positions[i].y}px, 0) translate(-50%, -50%) scale(${scale})`;
                this.trailDots[i].style.opacity = opacity;

                // 下一个节点跟随当前节点，形成连贯拖尾
                targetX = this.positions[i].x;
                targetY = this.positions[i].y;
            }

            // 隐藏降级后多余的节点
            for (let i = activeCount; i < totalNodes; i++) {
                this.trailDots[i].style.opacity = 0;
            }

            this.requestRender();
        }

        // 帧率自适应降级
        detectFps(delta) {
            const instantFps = 1000 / delta;
            this.fps = this.fps * 0.9 + instantFps * 0.1;

            if (this.fps < 30) {
                this.lowFpsCount++;
                if (this.lowFpsCount >= 3 && this.activeNodes > this.params.totalNodes * 0.6) {
                    this.activeNodes = Math.floor(this.params.totalNodes * 0.6);
                    this.updateNodeVisibility();
                    this.lowFpsCount = 0;
                }
            } 
            else if (this.fps > 50 && this.activeNodes < this.params.totalNodes) {
                this.fpsRecoveryCount++;
                if (this.fpsRecoveryCount >= 60) {
                    this.activeNodes = Math.min(this.activeNodes + 2, this.params.totalNodes);
                    this.updateNodeVisibility();
                    this.fpsRecoveryCount = 0;
                }
            } else {
                this.lowFpsCount = 0;
            }
        }

        updateNodeVisibility() {
            const total = this.params.totalNodes;
            for (let i = 0; i < total; i++) {
                this.trailDots[i].style.display = i < this.activeNodes ? 'block' : 'none';
            }
        }

        // 点击涟漪（完全保留原逻辑）
        createRipple(x, y) {
            const ripple = document.createElement('div');
            ripple.className = 'trail-ripple';
            ripple.style.setProperty('--x', `${x}px`);
            ripple.style.setProperty('--y', `${y}px`);
            document.body.appendChild(ripple);
            setTimeout(() => ripple.remove(), 400);
        }

        // 监听暗黑模式切换
        watchThemeChange() {
            const observer = new MutationObserver(() => {
                this.currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                this.params = this.themeParams[this.currentTheme];
                this.activeNodes = this.params.totalNodes;
                this.updateNodeVisibility();
            });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }

        // 销毁方法
        destroy() {
            this.stopRenderLoop();
            clearTimeout(this.hideTimer);
            clearTimeout(this.scrollTimer);
            this.trailDots.forEach(dot => dot.remove());
            this.trailDots = [];
            this.positions = [];
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        window.cursorTrail = new OptimizedCursorTrail();
    });
})();