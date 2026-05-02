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

    // 作品集筛选功能
    var filterButtons = document.querySelectorAll('.filter-btn');
    var portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                filterButtons.forEach(function(btn) { btn.classList.remove('active'); });
                this.classList.add('active');

                var filterValue = this.getAttribute('data-filter');

                portfolioItems.forEach(function(item) {
                    var category = item.getAttribute('data-category');
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
    var portfolioButtons = document.querySelectorAll('.portfolio-btn');
    var modal = document.getElementById('portfolioModal');
    var modalClose = document.querySelector('.modal-close');

    if (portfolioButtons.length > 0 && modal) {
        portfolioButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var portfolioItem = this.closest('.portfolio-item');
                var title = portfolioItem.querySelector('.portfolio-title').textContent;
                var description = portfolioItem.querySelector('.portfolio-description').textContent;

                modal.querySelector('.modal-title').textContent = title;
                modal.querySelector('.modal-description').textContent = description;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        if (modalClose) {
            modalClose.addEventListener('click', function() {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

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

    // 价格按钮 - 跳转到联系表单并预填套餐
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
                    
                    // 自动选择套餐
                    var packageSelect = document.querySelector('select[name="package"]');
                    if (packageSelect) {
                        for (var i = 0; i < packageSelect.options.length; i++) {
                            if (packageSelect.options[i].textContent.indexOf(packageName) !== -1) {
                                packageSelect.selectedIndex = i;
                                break;
                            }
                        }
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

    // 评价模态框功能
    initTestimonialsModal();

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

// 评价模态框功能
function initTestimonialsModal() {
    var modal = document.getElementById('testimonialsModal');
    var openBtn = document.getElementById('openTestimonialsModal');
    var closeBtn = document.getElementById('closeTestimonialsModal');

    if (!modal || !openBtn || !closeBtn) return;

    // 打开模态框
    openBtn.addEventListener('click', function() {
        modal.classList.remove('closing');
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        document.body.classList.remove('modal-closing');
    });

    // 关闭模态框
    function closeModal() {
        modal.classList.add('closing');
        document.body.classList.remove('modal-open');
        document.body.classList.add('modal-closing');
        setTimeout(function() {
            modal.classList.remove('active');
            modal.classList.remove('closing');
            document.body.classList.remove('modal-closing');
        }, 300);
    }

    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
    });

    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // 排序功能
    var sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            sortBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');

            var sortType = this.getAttribute('data-sort');
            var list = document.getElementById('testimonialsList');
            var items = Array.from(list.querySelectorAll('.testimonial-full-item'));

            items.sort(function(a, b) {
                if (sortType === 'latest') {
                    return new Date(b.getAttribute('data-time')) - new Date(a.getAttribute('data-time'));
                } else {
                    return parseInt(b.getAttribute('data-likes')) - parseInt(a.getAttribute('data-likes'));
                }
            });

            items.forEach(function(item) { list.appendChild(item); });
        });
    });

    // 点赞功能
    var likedItems = JSON.parse(localStorage.getItem('likedTestimonials') || '[]');

    // 初始化已点赞状态
    likedItems.forEach(function(id) {
        var btn = document.querySelector('.like-btn[data-id="' + id + '"]');
        if (btn) {
            btn.classList.add('liked');
        }
    });

    document.querySelectorAll('.like-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var countEl = this.querySelector('.like-count');
            var count = parseInt(countEl.textContent);

            if (likedItems.includes(id)) {
                // 取消点赞
                likedItems = likedItems.filter(function(item) { return item !== id; });
                countEl.textContent = count - 1;
                this.classList.remove('liked');
                this.closest('.testimonial-full-item').setAttribute('data-likes', count - 1);
            } else {
                // 点赞
                likedItems.push(id);
                countEl.textContent = count + 1;
                this.classList.add('liked');
                this.closest('.testimonial-full-item').setAttribute('data-likes', count + 1);

                // 点赞动画
                this.style.transform = 'scale(1.2)';
                setTimeout(function() { btn.style.transform = 'scale(1)'; }, 200);
            }

            localStorage.setItem('likedTestimonials', JSON.stringify(likedItems));
        });
    });

    // 发表评价
    var reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var nickname = this.querySelector('input[name="nickname"]').value;
            var identity = this.querySelector('select[name="identity"]').value;
            var content = this.querySelector('textarea[name="content"]').value;

            if (!nickname || !identity || !content) return;

            var list = document.getElementById('testimonialsList');
            var today = new Date();
            var dateStr = today.getFullYear() + '-' +
                String(today.getMonth() + 1).padStart(2, '0') + '-' +
                String(today.getDate()).padStart(2, '0');

            var avatars = ['🧑', '👩', '👨', '🎒', '📷'];
            var randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

            var newItem = document.createElement('div');
            newItem.className = 'testimonial-full-item';
            newItem.setAttribute('data-likes', '0');
            newItem.setAttribute('data-time', dateStr);
            newItem.innerHTML =
                '<div class="testimonial-full-content"><p>"' + content + '"</p></div>' +
                '<div class="testimonial-full-footer">' +
                '<div class="testimonial-author">' +
                '<div class="author-avatar">' + randomAvatar + '</div>' +
                '<div class="author-info"><h4>' + nickname + '</h4><span>' + identity + '</span></div>' +
                '</div>' +
                '<div class="testimonial-meta">' +
                '<span class="testimonial-date">' + dateStr + '</span>' +
                '<button class="like-btn" data-id="' + Date.now() + '"><i class="fas fa-heart"></i> <span class="like-count">0</span></button>' +
                '</div></div>';

            list.insertBefore(newItem, list.firstChild);

            // 为新评价的点赞按钮添加事件
            var newLikeBtn = newItem.querySelector('.like-btn');
            newLikeBtn.addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                var countEl = this.querySelector('.like-count');
                var count = parseInt(countEl.textContent);

                if (likedItems.includes(id)) {
                    likedItems = likedItems.filter(function(item) { return item !== id; });
                    countEl.textContent = count - 1;
                    this.classList.remove('liked');
                } else {
                    likedItems.push(id);
                    countEl.textContent = count + 1;
                    this.classList.add('liked');
                }
                localStorage.setItem('likedTestimonials', JSON.stringify(likedItems));
            });

            // 重置表单
            this.reset();

            // 显示通知
            var notification = document.createElement('div');
            notification.style.cssText = 'position:fixed;top:20px;right:20px;background-color:#2ecc71;color:white;padding:15px 20px;border-radius:5px;box-shadow:0 5px 15px rgba(0,0,0,0.2);z-index:3000;max-width:300px;';
            notification.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;"><span>评价发布成功！</span><button style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;margin-left:10px;" onclick="this.parentElement.parentElement.remove()">&times;</button></div>';
            document.body.appendChild(notification);
            setTimeout(function() { if (notification.parentNode) notification.remove(); }, 3000);
        });
    }
}

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