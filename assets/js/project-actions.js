// 项目卡片点击跳转逻辑（模块化，方便维护）
document.addEventListener('DOMContentLoaded', () => {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    // 统一处理卡片点击
    projectsGrid.addEventListener('click', (e) => {
        const projectCard = e.target.closest('.project-card');
        if (projectCard) {
            const gameId = projectCard.dataset.gameId;
            // 跳转到对应游戏详情页（通过gameId区分）
            window.location.href = `./game-detail.html?id=${gameId}`;
        }
    });

    // 可选：添加卡片点击反馈动效
    const allCards = document.querySelectorAll('.project-card');
    allCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            card.classList.add('animate-scale-in');
            setTimeout(() => {
                card.classList.remove('animate-scale-in');
            }, 300);
        });
    });
});