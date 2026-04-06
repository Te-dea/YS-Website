tailwind.config = {
    theme: {
        extend: {
            colors: {
                ins: {
                    white: '#FCFCFC',     // 更柔和的白底
                    beige: '#F8F4EE',     // 暖调米色，不暗沉
                    gray: '#EDECEA',      // 浅灰，提升层次感
                    accent: '#C8D9E6',    // 柔和蓝调 accent，更有活力
                    accentHover: '#B0C8D8', // accent hover 色
                    text: '#444444',      // 文字色更温和，不刺眼
                    textLight: '#666666'  // 次要文字色
                }
            },
            fontFamily: {
                sans: ['Inter', 'PingFang SC', 'Helvetica Neue', 'sans-serif'],
            },
            spacing: {
                '18': '4.5rem', // 补充间距，优化排版
            },
            transitionProperty: {
                'transform': 'transform 0.3s ease-in-out',
                'shadow': 'box-shadow 0.3s ease-in-out',
                'color': 'color 0.3s ease-in-out',
                'background': 'background-color 0.3s ease-in-out',
            },
            boxShadow: {
                'ins-card': '0 3px 10px rgba(0, 0, 0, 0.04)', // 更细腻的卡片阴影
                'ins-card-hover': '0 6px 16px rgba(0, 0, 0, 0.07)', // hover 阴影
            }
        }
    }
}