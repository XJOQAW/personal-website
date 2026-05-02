document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // 如果AOS没正确加载，确保所有元素可见
    setTimeout(function() {
        document.querySelectorAll('[data-aos]').forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }, 2000);

    // 暗色模式切换
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

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

        document.querySelectorAll('.nav-link').forEach(function(link) {
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
            } else {
                navbar.style.boxShadow = '0 2px 10px var(--shadow-color)';
            }
        });
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                var navHeight = navbar ? navbar.offsetHeight : 0;
                var targetPosition = targetElement.offsetTop - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // 抽屉功能
    document.querySelectorAll('.drawer-toggle').forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            var targetId = this.getAttribute('data-target') || 'aboutDrawerContent';
            var content = document.getElementById(targetId);
            if (content) {
                this.classList.toggle('active');
                content.classList.toggle('active');
                this.classList.add('jelly-animation');
                setTimeout(function() { toggle.classList.remove('jelly-animation'); }, 600);
            }
        });
    });

    // 功能按钮 - 滚动到对应区域
    document.querySelectorAll('.feature-btn[data-target]').forEach(function(button) {
        button.addEventListener('click', function() {
            var targetId = this.getAttribute('data-target');
            var targetElement = document.getElementById(targetId);
            if (targetElement) {
                var navHeight = navbar ? navbar.offsetHeight : 0;
                var targetPosition = targetElement.offsetTop - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // 价格按钮 - 跳转到联系表单并预填信息
    document.querySelectorAll('.pricing-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            var contactSection = document.getElementById('contact');
            if (contactSection) {
                var navHeight = navbar ? navbar.offsetHeight : 0;
                var targetPosition = contactSection.offsetTop - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });

                var pricingCard = this.closest('.pricing-card');
                if (pricingCard) {
                    var packageName = pricingCard.querySelector('.pricing-title').textContent;
                    var packagePrice = pricingCard.querySelector('.pricing-price').textContent;
                    var messageTextarea = document.querySelector('textarea[name="message"]');
                    if (messageTextarea) {
                        messageTextarea.value = '我想咨询' + packageName + '（' + packagePrice + '），请提供更多信息。';
                    }
                }
            }
        });
    });

    // 果冻动画 - 为按钮添加
    document.querySelectorAll('.btn, .feature-btn, .pricing-btn').forEach(function(button) {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // 果冻动画 - 为卡片添加
    document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card, .tutorial-card').forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 联系表单
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var submitButton = contactForm.querySelector('button[type="submit"]');
            var originalText = submitButton.textContent;
            submitButton.textContent = '发送中...';
            submitButton.disabled = true;

            setTimeout(function() {
                showNotification('消息发送成功！我会尽快回复您。', 'success');
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        });
    }

    // 数字统计动画
    var statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        var statObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var target = entry.target;
                    var finalNumber = parseInt(target.textContent);
                    var currentNumber = 0;
                    var increment = finalNumber / 50;
                    var timer = setInterval(function() {
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
        statNumbers.forEach(function(number) { statObserver.observe(number); });
    }

    // 悬停提示功能
    document.querySelectorAll('.drawer-toggle').forEach(function(toggle) {
        var tooltip = toggle.querySelector('.hover-tooltip');
        if (tooltip) {
            toggle.addEventListener('mouseenter', function() {
                var targetId = this.getAttribute('data-target') || 'aboutDrawerContent';
                var content = document.getElementById(targetId);
                if (content) {
                    if (content.classList.contains('active')) {
                        tooltip.textContent = '点击收起详细内容';
                    } else {
                        tooltip.textContent = '点击展开查看详细自我介绍';
                    }
                }
            });
        }
    });

    // 粒子效果
    initParticles();

    // 通知功能
    function showNotification(message, type) {
        var existingNotification = document.querySelector('.notification');
        if (existingNotification) existingNotification.remove();

        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background-color:' +
            (type === 'success' ? '#2ecc71' : '#e74c3c') +
            ';color:white;padding:15px 20px;border-radius:5px;box-shadow:0 5px 15px rgba(0,0,0,0.2);z-index:3000;max-width:300px;';
        notification.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span>' + message + '</span>' +
            '<button style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;margin-left:10px;" onclick="this.parentElement.parentElement.remove()">&times;</button>' +
            '</div>';
        document.body.appendChild(notification);
        setTimeout(function() { if (notification.parentNode) notification.remove(); }, 5000);
    }
});

// 粒子效果函数
function initParticles() {
    var heroSection = document.getElementById('hero');
    if (!heroSection) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    heroSection.style.position = 'relative';
    heroSection.insertBefore(canvas, heroSection.firstChild);

    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 50;

    function resizeCanvas() {
        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3 + 0.1;
    }

    for (var i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 107, 157, ' + p.opacity + ')';
            ctx.fill();

            for (var j = i + 1; j < particles.length; j++) {
                var p2 = particles[j];
                var dx = p.x - p2.x;
                var dy = p.y - p2.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = 'rgba(196, 77, 255, ' + (0.1 * (1 - dist / 100)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    animate();
}

// 页面加载
window.addEventListener('load', function() {
    var loader = document.querySelector('.loading');
    if (loader) loader.classList.add('hidden');
    document.body.classList.add('loaded');
});