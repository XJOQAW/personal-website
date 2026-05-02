// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化AOS.js（滚动动画）
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // 暗色模式切换
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // 主题切换事件
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            // 添加切换动画
            document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        });
    }
    
    // 更新主题图标
    function updateThemeIcon(theme) {
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // 汉堡菜单
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // 点击导航链接后关闭菜单
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 2px 20px var(--shadow-color)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.boxShadow = '0 2px 10px var(--shadow-color)';
                navbar.style.backdropFilter = 'none';
            }
        });
    }

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 表单处理
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // 显示加载状态
            submitButton.textContent = '发送中...';
            submitButton.disabled = true;
            
            // 模拟表单提交（实际使用时需要替换为真实的表单提交URL）
            setTimeout(() => {
                // 显示成功消息
                showNotification('消息发送成功！我会尽快回复您。', 'success');
                
                // 重置表单
                contactForm.reset();
                
                // 恢复按钮状态
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // 如果是Formspree，取消注释下面的代码
                /*
                fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        showNotification('消息发送成功！我会尽快回复您。', 'success');
                        contactForm.reset();
                    } else {
                        throw new Error('发送失败');
                    }
                })
                .catch(error => {
                    showNotification('发送失败，请稍后重试。', 'error');
                })
                .finally(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                });
                */
            }, 1500);
        });
    }

    // 作品集筛选功能
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有按钮的active类
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // 给当前按钮添加active类
                this.classList.add('active');
                
                const filterValue = this.getAttribute('data-filter');
                
                portfolioItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeInUp 0.5s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // 作品集模态框
    const portfolioButtons = document.querySelectorAll('.portfolio-btn');
    const modal = document.getElementById('portfolioModal');
    const modalClose = document.querySelector('.modal-close');
    
    if (portfolioButtons.length > 0 && modal) {
        portfolioButtons.forEach(button => {
            button.addEventListener('click', function() {
                const portfolioItem = this.closest('.portfolio-item');
                const title = portfolioItem.querySelector('.portfolio-title').textContent;
                const description = portfolioItem.querySelector('.portfolio-description').textContent;
                const category = portfolioItem.getAttribute('data-category');
                
                // 更新模态框内容
                modal.querySelector('.modal-title').textContent = title;
                modal.querySelector('.modal-description').textContent = description;
                
                // 显示模态框
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // 添加打开动画
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.style.opacity = '1';
                }, 10);
            });
        });
        
        // 关闭模态框
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                closeModal();
            });
        }
        
        // 点击模态框外部关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
    }
    
    function closeModal() {
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    // 技能进度条动画
    const skillBars = document.querySelectorAll('.skill-progress');
    
    if (skillBars.length > 0) {
        const observerOptions = {
            threshold: 0.5
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const width = entry.target.style.width;
                    entry.target.style.width = '0%';
                    
                    setTimeout(() => {
                        entry.target.style.width = width;
                    }, 100);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        skillBars.forEach(bar => {
            observer.observe(bar);
        });
    }

    // 数字统计动画
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length > 0) {
        const statObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalNumber = parseInt(target.textContent);
                    let currentNumber = 0;
                    const increment = finalNumber / 50;
                    
                    const timer = setInterval(() => {
                        currentNumber += increment;
                        if (currentNumber >= finalNumber) {
                            currentNumber = finalNumber;
                            clearInterval(timer);
                        }
                        target.textContent = Math.floor(currentNumber) + '+';
                    }, 30);
                    
                    statObserver.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(number => {
            statObserver.observe(number);
        });
    }

    // 导航栏活动状态
    const sections = document.querySelectorAll('section[id]');
    
    if (sections.length > 0) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}` || 
                            link.getAttribute('href') === `index.html#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }

    // 通知功能
    function showNotification(message, type = 'info') {
        // 移除现有通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 关闭按钮事件
        const closeButton = notification.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                notification.remove();
            });
        }
        
        // 自动关闭
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    // 添加通知动画样式
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: 10px;
            opacity: 0.7;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    `;
    document.head.appendChild(notificationStyles);

    // 页面加载完成后的初始化
    console.log('个人主页加载完成！');
    
    // 检查是否首次访问
    if (!localStorage.getItem('visited')) {
        console.log('欢迎访问我的个人主页！');
        localStorage.setItem('visited', 'true');
    }
});

// 页面加载动画
window.addEventListener('load', function() {
    // 隐藏加载动画（如果有的话）
    const loader = document.querySelector('.loading');
    if (loader) {
        loader.classList.add('hidden');
    }
    
    // 触发初始动画
    document.body.classList.add('loaded');
    
    // 二次元风格交互效果
    initAnimeEffects();
});

// 二次元风格交互效果
function initAnimeEffects() {
    // 鼠标跟随光标效果（简化版）
    const cursor = document.createElement('div');
    cursor.className = 'anime-cursor';
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(cursor);
    
    // 添加光标样式
    const cursorStyles = document.createElement('style');
    cursorStyles.textContent = `
        .anime-cursor {
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
        }
        
        .cursor-dot {
            width: 8px;
            height: 8px;
            background: var(--primary-color);
            border-radius: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            transition: transform 0.1s ease;
        }
        
        .cursor-ring {
            width: 40px;
            height: 40px;
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            transition: all 0.3s ease;
            opacity: 0.5;
        }
        
        .anime-cursor.hover .cursor-ring {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
        }
        
        .anime-cursor.click .cursor-dot {
            transform: translate(-50%, -50%) scale(2);
        }
        
        @media (max-width: 768px) {
            .anime-cursor {
                display: none;
            }
        }
    `;
    document.head.appendChild(cursorStyles);
    
    // 鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // 鼠标悬停效果
    const interactiveElements = document.querySelectorAll('a, button, .skill-card, .portfolio-item, .contact-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            cursor.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', function() {
            cursor.classList.remove('hover');
        });
        
        el.addEventListener('click', function() {
            cursor.classList.add('click');
            setTimeout(() => {
                cursor.classList.remove('click');
            }, 300);
        });
    });
    
    // 点击波纹效果
    document.addEventListener('click', function(e) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        
        // 添加波纹样式
        const rippleStyles = document.createElement('style');
        rippleStyles.textContent = `
            .click-ripple {
                position: fixed;
                width: 20px;
                height: 20px;
                background: var(--primary-color);
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: ripple-effect 0.6s ease-out;
                pointer-events: none;
                z-index: 9998;
                opacity: 0.5;
            }
            
            @keyframes ripple-effect {
                to {
                    transform: translate(-50%, -50%) scale(10);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyles);
        
        // 移除波纹元素
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
    
    // 滚动视差效果
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.about-image, .skill-icon');
        
        parallaxElements.forEach(el => {
            const speed = 0.5;
            const rect = el.getBoundingClientRect();
            const visible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (visible) {
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos * 0.1}px)`;
            }
        });
    });
    
    // 卡片倾斜效果
    const tiltElements = document.querySelectorAll('.skill-card, .portfolio-item');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        el.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
    
    // 打字机效果（为标题添加）
    const titles = document.querySelectorAll('.section-title');
    titles.forEach(title => {
        const text = title.textContent;
        title.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // 当元素进入视口时开始打字效果
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(title);
    });
    
    // 粒子效果背景（简化版）
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const particles = document.createElement('div');
        particles.className = 'particles-bg';
        particles.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;
        
        // 创建粒子
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 10 + 2}px;
                height: ${Math.random() * 10 + 2}px;
                background: var(--primary-color);
                border-radius: 50%;
                opacity: ${Math.random() * 0.3 + 0.1};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-particle ${Math.random() * 10 + 10}s linear infinite;
            `;
            particles.appendChild(particle);
        }
        
        // 添加粒子动画样式
        const particleStyles = document.createElement('style');
        particleStyles.textContent = `
            @keyframes float-particle {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0.1;
                }
                50% {
                    opacity: 0.3;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0.1;
                }
            }
        `;
        document.head.appendChild(particleStyles);
        
        section.style.position = 'relative';
        section.insertBefore(particles, section.firstChild);
    });
    
    // 懒加载图片（为将来的图片准备）
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // 平滑滚动增强
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                // 添加滚动动画类
                document.body.classList.add('smooth-scrolling');
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 移除滚动动画类
                setTimeout(() => {
                    document.body.classList.remove('smooth-scrolling');
                }, 1000);
            }
        });
    });
    
    // 添加平滑滚动样式
    const smoothScrollStyles = document.createElement('style');
    smoothScrollStyles.textContent = `
        .smooth-scrolling {
            scroll-behavior: smooth !important;
        }
        
        .smooth-scrolling * {
            scroll-behavior: smooth !important;
        }
    `;
    document.head.appendChild(smoothScrollStyles);
    
    console.log('二次元风格交互效果初始化完成！');
}