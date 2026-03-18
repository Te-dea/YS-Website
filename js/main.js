// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 修复：确保CSS变量存在，兼容旧浏览器
  if (!window.getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) {
    document.documentElement.style.setProperty('--navbar-height', '70px');
    document.documentElement.style.setProperty('--navbar-height-scrolled', '60px');
  }

  // 1. 导航栏滚动效果
  const navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  // 防抖优化，避免频繁触发
  let scrollTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(handleNavbarScroll, 10);
  });
  handleNavbarScroll(); // 初始检查

  // 2. 移动端菜单切换（适配触控）
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      // 切换菜单图标
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
      // 禁止/允许页面滚动
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
      // 修复：iOS下body滚动问题
      document.body.style.position = navLinks.classList.contains('active') ? 'fixed' : '';
    });
  }

  // 3. 模态框交互（适配移动端触控）
  const modalTriggers = document.querySelectorAll('.work-card');
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('.close-modal');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const targetId = this.getAttribute('data-modal-target');
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed'; // iOS兼容
      }
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-modal-close');
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = ''; // 恢复
      }
    });
  });

  // 点击模态框外部关闭（适配移动端）
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
      }
    });
  });

  // 4. 滚动渐入效果（更柔和的触发时机）
  const fadeElements = document.querySelectorAll('.fade-in, .log-item');
  function checkFade() {
    fadeElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      // 提前触发，更适配移动端
      if (elementTop < window.innerHeight * 0.85 && elementBottom > 0) {
        element.classList.add('visible');
      }
    });
  }
  // 防抖优化
  let fadeTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(checkFade, 20);
  });
  checkFade(); // 初始加载检查

  // 5. 表单提交（移动端友好）
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // 简单验证
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const message = document.getElementById('message')?.value || '';
      
      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (name && emailRegex.test(email) && message) {
        // 替换alert为更友好的提示（可选：可替换为Toast组件）
        alert('留言提交成功！我们会尽快回复你 😊');
        contactForm.reset(); // 重置表单
      } else if (!emailRegex.test(email) && email) {
        alert('请输入有效的邮箱地址哦～');
      } else {
        alert('请填写完整的信息哦～');
      }
    });
  }

  // 6. 导航链接点击关闭移动端菜单
  const navLinkItems = document.querySelectorAll('.nav-links a');
  navLinkItems.forEach(link => {
    link.addEventListener('click', function(e) {
      // 平滑滚动到锚点
      const targetId = this.getAttribute('href').slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      // 关闭菜单
      if (navLinks) {
        navLinks.classList.remove('active');
      }
      if (menuToggle) {
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
      document.body.style.overflow = '';
      document.body.style.position = '';
    });
  });
});