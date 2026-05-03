// Firebase配置
try {
    var firebaseConfig = {
        apiKey: "AIzaSyA1pqvmi6UR4LkX0vqz6C6GdgMKUY4ox8w",
        authDomain: "yifang-website.firebaseapp.com",
        projectId: "yifang-website",
        storageBucket: "yifang-website.firebasestorage.app",
        messagingSenderId: "127736935080",
        appId: "1:127736935080:web:dae94ee9e4145bf51a889d"
    };
    firebase.initializeApp(firebaseConfig);
    var auth = firebase.auth();
} catch(e) {
    console.log('Firebase初始化失败，继续加载页面');
    var auth = null;
}

document.addEventListener('DOMContentLoaded', function() {
    // 加载进度条
    var loader = document.getElementById('loader');
    var loaderBar = document.getElementById('loaderBar');
    var loaderText = document.getElementById('loaderText');
    var progress = 0;
    var loaderInterval = setInterval(function() {
        progress += Math.random() * 20 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loaderInterval);
            setTimeout(function() {
                if (loader) {
                    loader.style.opacity = '0';
                    loader.style.pointerEvents = 'none';
                    setTimeout(function() {
                        loader.style.display = 'none';
                    }, 500);
                }
            }, 300);
        }
        if (loaderBar) loaderBar.style.width = progress + '%';
        if (loaderText) loaderText.textContent = Math.floor(progress) + '%';
    }, 80);

    // 开屏动画
    var splash = document.getElementById('splash');
    setTimeout(function() {
        splash.classList.add('hidden');
    }, 2000);

    // 隐藏式导航栏
    var nav = document.getElementById('nav');
    var lastScroll = 0;
    window.addEventListener('scroll', function() {
        var currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            nav.classList.add('visible');
            if (currentScroll > lastScroll) {
                nav.classList.remove('visible');
            }
        } else {
            nav.classList.remove('visible');
            nav.classList.add('at-top');
        }
        if (currentScroll > 100) {
            nav.classList.remove('at-top');
        }
        lastScroll = currentScroll;
    });

    // 汉堡菜单
    var hamburger = document.getElementById('hamburgerBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
    document.querySelectorAll('.mobile-menu a').forEach(function(link) {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // 主题切换
    var themeBtn = document.getElementById('themeBtn');
    var html = document.documentElement;
    var savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    themeBtn.addEventListener('click', function() {
        var current = html.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });
    function updateThemeIcon(theme) {
        themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // 关于我抽屉
    var aboutToggle = document.getElementById('aboutToggle');
    var aboutBody = document.getElementById('aboutBody');
    aboutToggle.addEventListener('click', function() {
        aboutToggle.classList.toggle('active');
        aboutBody.classList.toggle('active');
    });

    // 作品集轮播
    var track = document.getElementById('portfolioTrack');
    var slides = track.querySelectorAll('.portfolio-slide');
    var dotsContainer = document.getElementById('portfolioDots');
    var currentIndex = 0;
    slides.forEach(function(_, i) {
        var dot = document.createElement('button');
        dot.className = 'portfolio-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', function() { goToSlide(i); });
        dotsContainer.appendChild(dot);
    });
    function goToSlide(index) {
        currentIndex = index;
        track.style.transform = 'translateX(-' + (index * 100) + '%)';
        dotsContainer.querySelectorAll('.portfolio-dot').forEach(function(d, i) {
            d.classList.toggle('active', i === index);
        });
    }
    document.getElementById('portfolioPrev').addEventListener('click', function() {
        goToSlide((currentIndex - 1 + slides.length) % slides.length);
    });
    document.getElementById('portfolioNext').addEventListener('click', function() {
        goToSlide((currentIndex + 1) % slides.length);
    });

    // 价格套餐标签页
    document.querySelectorAll('.pricing-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.pricing-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            var target = this.getAttribute('data-tab');
            document.getElementById('studioPricing').style.display = target === 'studio' ? 'grid' : 'none';
            document.getElementById('eventPricing').style.display = target === 'event' ? 'grid' : 'none';
        });
    });

    // 价格按钮跳转
    document.querySelectorAll('.pricing-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var card = this.closest('.pricing-card');
            var name = card.querySelector('h3').textContent;
            var price = card.querySelector('.pricing-price').textContent;
            var contactSection = document.getElementById('contact');
            contactSection.scrollIntoView({ behavior: 'smooth' });
            var select = document.querySelector('select[name="套餐选择"]');
            if (select) {
                for (var i = 0; i < select.options.length; i++) {
                    if (select.options[i].textContent.indexOf(name) !== -1) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }
        });
    });

    // 功能按钮跳转
    document.querySelectorAll('.service-btn[data-target]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var target = document.getElementById(this.getAttribute('data-target'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 登录模态框
    var loginModal = document.getElementById('loginModal');
    var loginBtn = document.getElementById('loginBtn');
    var mobileLoginBtn = document.getElementById('mobileLoginBtn');
    var loginClose = document.getElementById('loginClose');
    function openLogin() { loginModal.classList.add('active'); }
    function closeLogin() { loginModal.classList.remove('active'); }
    loginBtn.addEventListener('click', openLogin);
    mobileLoginBtn.addEventListener('click', openLogin);
    loginClose.addEventListener('click', closeLogin);
    loginModal.addEventListener('click', function(e) { if (e.target === loginModal) closeLogin(); });

    // 登录/注册标签
    document.querySelectorAll('.login-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.login-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            var target = this.getAttribute('data-tab');
            document.getElementById('loginForm').style.display = target === 'login' ? 'flex' : 'none';
            document.getElementById('registerForm').style.display = target === 'register' ? 'flex' : 'none';
            document.getElementById('loginTitle').textContent = target === 'login' ? '登录' : '注册';
        });
    });

    // 登录表单
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!auth) { showNotification('登录功能暂不可用', 'error'); return; }
        var account = document.getElementById('loginAccount').value;
        var password = document.getElementById('loginPassword').value;
        auth.signInWithEmailAndPassword(account + '@yifang.user', password)
            .then(function() { closeLogin(); showNotification('登录成功！', 'success'); })
            .catch(function(err) { showNotification('登录失败：' + err.message, 'error'); });
    });

    // 注册表单
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!auth) { showNotification('注册功能暂不可用', 'error'); return; }
        var name = document.getElementById('registerName').value;
        var account = document.getElementById('registerAccount').value;
        var password = document.getElementById('registerPassword').value;
        var confirm = document.getElementById('registerConfirm').value;
        if (password !== confirm) { showNotification('两次密码不一致', 'error'); return; }
        auth.createUserWithEmailAndPassword(account + '@yifang.user', password)
            .then(function(result) { return result.user.updateProfile({ displayName: name }); })
            .then(function() { closeLogin(); showNotification('注册成功！', 'success'); })
            .catch(function(err) { showNotification('注册失败：' + err.message, 'error'); });
    });

    // Google登录
    document.getElementById('googleLoginBtn').addEventListener('click', function() {
        if (!auth) { showNotification('登录功能暂不可用', 'error'); return; }
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then(function() { closeLogin(); showNotification('Google登录成功！', 'success'); })
            .catch(function(err) { showNotification('登录失败：' + err.message, 'error'); });
    });

    // 监听登录状态
    if (auth) {
        auth.onAuthStateChanged(function(user) {
            var authSection = document.getElementById('authSection');
            var userSection = document.getElementById('userSection');
            if (user) {
                authSection.style.display = 'none';
                userSection.style.display = 'flex';
                document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
            } else {
                authSection.style.display = 'block';
                userSection.style.display = 'none';
            }
        });
    }

    // 评价模态框
    var reviewsModal = document.getElementById('reviewsModal');
    var reviewsMoreBtn = document.getElementById('reviewsMoreBtn');
    var reviewsClose = document.getElementById('reviewsClose');
    reviewsMoreBtn.addEventListener('click', function() { reviewsModal.classList.add('active'); });
    reviewsClose.addEventListener('click', function() { reviewsModal.classList.remove('active'); });
    reviewsModal.addEventListener('click', function(e) { if (e.target === reviewsModal) reviewsModal.classList.remove('active'); });

    // 评价排序
    document.querySelectorAll('.sort-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.sort-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            var type = this.getAttribute('data-sort');
            var list = document.getElementById('reviewsList');
            var items = Array.from(list.querySelectorAll('.review-item'));
            items.sort(function(a, b) {
                if (type === 'latest') return new Date(b.dataset.time) - new Date(a.dataset.time);
                return parseInt(b.dataset.likes) - parseInt(a.dataset.likes);
            });
            items.forEach(function(item) { list.appendChild(item); });
        });
    });

    // 点赞功能
    var likedItems = JSON.parse(localStorage.getItem('likedReviews') || '[]');
    likedItems.forEach(function(id) {
        var btn = document.querySelector('.like-btn[data-id="' + id + '"]');
        if (btn) btn.classList.add('liked');
    });
    document.querySelectorAll('.like-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var countEl = this.querySelector('span');
            var count = parseInt(countEl.textContent);
            if (likedItems.includes(id)) {
                likedItems = likedItems.filter(function(i) { return i !== id; });
                countEl.textContent = count - 1;
                this.classList.remove('liked');
            } else {
                likedItems.push(id);
                countEl.textContent = count + 1;
                this.classList.add('liked');
            }
            localStorage.setItem('likedReviews', JSON.stringify(likedItems));
        });
    });

    // 联系表单
    var contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var formData = new FormData(contactForm);
        fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.success) {
                    showNotification('提交成功！我会在24小时内回复您。', 'success');
                    contactForm.reset();
                } else {
                    showNotification('提交失败，请重试', 'error');
                }
            })
            .catch(function() { showNotification('提交失败，请重试', 'error'); });
    });

    // 通知功能
    function showNotification(message, type) {
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();

    // 作品集筛选
    var filterButtons = document.querySelectorAll('.filter-btn');
    var portfolioCards = document.querySelectorAll('.portfolio-card');
    if (filterButtons.length > 0) {
        filterButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterButtons.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                var filter = this.getAttribute('data-filter');
                portfolioCards.forEach(function(card) {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 作品集点击放大
    portfolioCards.forEach(function(card) {
        card.addEventListener('click', function() {
            var img = this.querySelector('img');
            var title = this.querySelector('h3').textContent;
            var desc = this.querySelector('p').textContent;
            var modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = '<div class="modal-box" style="max-width:800px">' +
                '<button class="modal-close">&times;</button>' +
                '<div class="modal-img-box">' + (img ? '<img src="' + img.src + '">' : '<span style="font-size:80px;opacity:0.5">📸</span>') + '</div>' +
                '<div class="modal-img-info"><h3>' + title + '</h3><p>' + desc + '</p></div></div>';
            document.body.appendChild(modal);
            modal.querySelector('.modal-close').addEventListener('click', function() { modal.remove(); });
            modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
        });
    });

    // 汉堡菜单（作品集页面）
    var hamburger = document.getElementById('hamburgerBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // 主题切换（作品集页面）
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        var html = document.documentElement;
        var savedTheme = localStorage.getItem('theme') || 'light';
        html.setAttribute('data-theme', savedTheme);
        themeBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeBtn.addEventListener('click', function() {
            var current = html.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            this.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // 通知功能
    function showNotification(message, type) {
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();
        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(function() { if (notification.parentNode) notification.remove(); }, 3000);
    }

    // 统计数字动画
    var statNumbers = document.querySelectorAll('.hero-stat-num');
    var statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var target = entry.target;
                var text = target.textContent;
                var num = parseInt(text);
                var suffix = text.replace(/[0-9]/g, '');
                var current = 0;
                var timer = setInterval(function() {
                    current += num / 30;
                    if (current >= num) {
                        current = num;
                        clearInterval(timer);
                    }
                    target.textContent = Math.floor(current) + suffix;
                }, 30);
                statObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    statNumbers.forEach(function(num) { statObserver.observe(num); });

    // 鼠标跟随粒子效果
    var heroSection = document.querySelector('.hero');
    if (heroSection) {
        var particles = [];
        var particleCount = 30;
        var canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
        heroSection.style.position = 'relative';
        heroSection.insertBefore(canvas, heroSection.firstChild);

        var ctx = canvas.getContext('2d');
        var mouseX = 0, mouseY = 0;

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
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        for (var i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        heroSection.addEventListener('mousemove', function(e) {
            var rect = heroSection.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                var dx = mouseX - p.x;
                var dy = mouseY - p.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    p.x += dx * 0.02;
                    p.y += dy * 0.02;
                }
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + p.opacity + ')';
                ctx.fill();

                for (var j = i + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var ddx = p.x - p2.x;
                    var ddy = p.y - p2.y;
                    var ddist = Math.sqrt(ddx * ddx + ddy * ddy);
                    if (ddist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(255,255,255,' + (0.1 * (1 - ddist / 100)) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // 卡片3D倾斜效果
    document.querySelectorAll('.service-card, .review-card, .pricing-card').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = this.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;
            var rotateX = (y - centerY) / 15;
            var rotateY = (centerX - x) / 15;
            this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // 滚动显示动画
    var revealElements = document.querySelectorAll('.section-header, .service-card, .process-item, .review-card, .pricing-card, .contact-item, .about-card');
    revealElements.forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(function(el, index) {
        el.style.transitionDelay = (index % 6) * 0.1 + 's';
        revealObserver.observe(el);
    });

    // 水波纹点击效果
    document.addEventListener('click', function(e) {
        var ripple = document.createElement('div');
        ripple.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
            'width:0;height:0;border-radius:50%;pointer-events:none;z-index:9999;' +
            'background:radial-gradient(circle,rgba(255,107,157,0.3),transparent);' +
            'transform:translate(-50%,-50%);animation:rippleAnim 0.6s ease-out forwards;';
        document.body.appendChild(ripple);
        setTimeout(function() { ripple.remove(); }, 600);
    });

    // 水波纹动画
    var rippleStyle = document.createElement('style');
    rippleStyle.textContent = '@keyframes rippleAnim{to{width:200px;height:200px;opacity:0}}';
    document.head.appendChild(rippleStyle);

    // 导航高亮当前区域
    var navLinks = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY + 100;
        sections.forEach(function(section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // 图片懒加载
    var lazyImages = document.querySelectorAll('img[data-src]');
    var imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    lazyImages.forEach(function(img) { imageObserver.observe(img); });

    // 返回顶部按钮
    var scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:44px;height:44px;' +
        'border-radius:50%;border:none;background:var(--text);color:var(--bg);font-size:18px;' +
        'cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s;z-index:999;' +
        'display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                var navHeight = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 0;
                window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
            }
        });
    });
});

// 页面加载
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});