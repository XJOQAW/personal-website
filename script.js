// 主脚本 - 页面加载后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');

    // ===== 开屏动画 =====
    var splash = document.getElementById('splash');
    if (splash) {
        setTimeout(function() {
            splash.style.opacity = '0';
            splash.style.transform = 'scale(1.1)';
            setTimeout(function() {
                splash.style.display = 'none';
            }, 600);
        }, 1500);
    }

    // ===== 隐藏式导航栏 =====
    var nav = document.getElementById('nav');
    var lastScroll = 0;
    window.addEventListener('scroll', function() {
        var currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            nav.classList.add('visible');
            if (currentScroll > lastScroll) {
                nav.classList.remove('visible');
            }
            nav.classList.remove('at-top');
        } else {
            nav.classList.remove('visible');
            nav.classList.add('at-top');
        }
        lastScroll = currentScroll;
    });

    // ===== 汉堡菜单 =====
    var hamburger = document.getElementById('hamburgerBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        mobileMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // ===== 主题切换 =====
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
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
    }
    function updateThemeIcon(theme) {
        if (themeBtn) {
            themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    // ===== 关于我抽屉 =====
    var aboutToggle = document.getElementById('aboutToggle');
    var aboutBody = document.getElementById('aboutBody');
    if (aboutToggle && aboutBody) {
        aboutToggle.addEventListener('click', function() {
            aboutToggle.classList.toggle('active');
            aboutBody.classList.toggle('active');
        });
    }

    // ===== 英雄区域粒子 =====
    var heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        var ctx = heroCanvas.getContext('2d');
        var particles = [];
        var mouseX = heroCanvas.width / 2, mouseY = heroCanvas.height / 2;

        function resizeCanvas() {
            heroCanvas.width = heroCanvas.parentElement.offsetWidth;
            heroCanvas.height = heroCanvas.parentElement.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function Particle() {
            this.x = Math.random() * heroCanvas.width;
            this.y = Math.random() * heroCanvas.height;
            this.size = Math.random() * 4 + 2;
            this.speedX = (Math.random() - 0.5) * 1;
            this.speedY = (Math.random() - 0.5) * 1;
            this.opacity = Math.random() * 0.6 + 0.2;
        }
        for (var i = 0; i < 50; i++) particles.push(new Particle());

        heroCanvas.parentElement.addEventListener('mousemove', function(e) {
            var rect = heroCanvas.parentElement.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        function animate() {
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                var dx = mouseX - p.x;
                var dy = mouseY - p.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    p.x += dx * 0.01;
                    p.y += dy * 0.01;
                    p.opacity = Math.min(0.8, p.opacity + 0.01);
                } else {
                    p.opacity = Math.max(0.2, p.opacity - 0.005);
                }
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > heroCanvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > heroCanvas.height) p.speedY *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + p.opacity + ')';
                ctx.fill();

                for (var j = i + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var ddx = p.x - p2.x;
                    var ddy = p.y - p2.y;
                    var dd = Math.sqrt(ddx * ddx + ddy * ddy);
                    if (dd < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(255,255,255,' + (0.15 * (1 - dd / 120)) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ===== 统计数字动画 =====
    document.querySelectorAll('.hero-stat-num').forEach(function(el) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var target = entry.target;
                    var text = target.textContent;
                    var num = parseInt(text);
                    var suffix = text.replace(/[0-9]/g, '');
                    var current = 0;
                    var timer = setInterval(function() {
                        current += num / 30;
                        if (current >= num) { current = num; clearInterval(timer); }
                        target.textContent = Math.floor(current) + suffix;
                    }, 30);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(el);
    });

    // ===== 作品集轮播 =====
    var track = document.getElementById('portfolioTrack');
    var dotsContainer = document.getElementById('portfolioDots');
    if (track && dotsContainer) {
        var slides = track.querySelectorAll('.portfolio-slide');
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
    }

    // ===== 价格套餐标签页 =====
    document.querySelectorAll('.pricing-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.pricing-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            var target = this.getAttribute('data-tab');
            document.getElementById('studioPricing').style.display = target === 'studio' ? 'grid' : 'none';
            document.getElementById('eventPricing').style.display = target === 'event' ? 'grid' : 'none';
        });
    });

    // ===== 价格按钮跳转 =====
    document.querySelectorAll('.pricing-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var card = this.closest('.pricing-card');
            var name = card.querySelector('h3').textContent;
            var contactSection = document.getElementById('contact');
            contactSection.scrollIntoView({ behavior: 'smooth' });
            var select = document.querySelector('select[name="套餐选择"]');
            if (select) {
                for (var i = 0; i < select.options.length; i++) {
                    if (select.options[i].textContent.indexOf(name) !== -1) {
                        select.selectedIndex = i; break;
                    }
                }
            }
        });
    });

    // ===== 功能按钮跳转 =====
    document.querySelectorAll('.service-btn[data-target]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var target = document.getElementById(this.getAttribute('data-target'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ===== 登录模态框 =====
    var loginModal = document.getElementById('loginModal');
    var loginBtn = document.getElementById('loginBtn');
    var mobileLoginBtn = document.getElementById('mobileLoginBtn');
    var loginClose = document.getElementById('loginClose');
    function openLogin() { if (loginModal) loginModal.classList.add('active'); }
    function closeLogin() { if (loginModal) loginModal.classList.remove('active'); }
    if (loginBtn) loginBtn.addEventListener('click', openLogin);
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', openLogin);
    if (loginClose) loginClose.addEventListener('click', closeLogin);
    if (loginModal) loginModal.addEventListener('click', function(e) { if (e.target === loginModal) closeLogin(); });

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

    // Firebase登录（安全处理）
    var auth = null;
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp({
                apiKey: "AIzaSyA1pqvmi6UR4LkX0vqz6C6GdgMKUY4ox8w",
                authDomain: "yifang-website.firebaseapp.com",
                projectId: "yifang-website",
                storageBucket: "yifang-website.firebasestorage.app",
                messagingSenderId: "127736935080",
                appId: "1:127736935080:web:dae94ee9e4145bf51a889d"
            });
            auth = firebase.auth();
        }
    } catch(e) { console.log('Firebase未加载'); }

    if (auth) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            var account = document.getElementById('loginAccount').value;
            var password = document.getElementById('loginPassword').value;
            auth.signInWithEmailAndPassword(account + '@yifang.user', password)
                .then(function() { closeLogin(); showNotification('登录成功！', 'success'); })
                .catch(function(err) { showNotification('登录失败：' + err.message, 'error'); });
        });

        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
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

        document.getElementById('googleLoginBtn').addEventListener('click', function() {
            auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
                .then(function() { closeLogin(); showNotification('Google登录成功！', 'success'); })
                .catch(function(err) { showNotification('登录失败：' + err.message, 'error'); });
        });

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

    // ===== 评价模态框 =====
    var reviewsModal = document.getElementById('reviewsModal');
    var reviewsMoreBtn = document.getElementById('reviewsMoreBtn');
    var reviewsClose = document.getElementById('reviewsClose');
    if (reviewsMoreBtn) reviewsMoreBtn.addEventListener('click', function() { reviewsModal.classList.add('active'); });
    if (reviewsClose) reviewsClose.addEventListener('click', function() { reviewsModal.classList.remove('active'); });
    if (reviewsModal) reviewsModal.addEventListener('click', function(e) { if (e.target === reviewsModal) reviewsModal.classList.remove('active'); });

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

    // ===== 联系表单 =====
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
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
    }

    // ===== 作品集筛选 =====
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            var filter = this.getAttribute('data-filter');
            document.querySelectorAll('.portfolio-card').forEach(function(card) {
                card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
            });
        });
    });

    // ===== 作品集点击放大 =====
    document.querySelectorAll('.portfolio-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var img = this.querySelector('img');
            var title = this.querySelector('h3').textContent;
            var desc = this.querySelector('p').textContent;
            var modal = document.getElementById('portfolioModal');
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDesc').textContent = desc;
            if (img) document.getElementById('modalImg').src = img.src;
            modal.classList.add('active');
        });
    });
    var portfolioClose = document.getElementById('portfolioClose');
    var portfolioModal = document.getElementById('portfolioModal');
    if (portfolioClose) portfolioClose.addEventListener('click', function() { portfolioModal.classList.remove('active'); });
    if (portfolioModal) portfolioModal.addEventListener('click', function(e) { if (e.target === portfolioModal) portfolioModal.classList.remove('active'); });

    // ===== 3D倾斜效果 =====
    document.querySelectorAll('.service-card, .review-card, .pricing-card').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = this.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var rotateX = (y - rect.height / 2) / 15;
            var rotateY = (rect.width / 2 - x) / 15;
            this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // ===== 滚动显示动画 =====
    var revealElements = document.querySelectorAll('.section-header, .service-card, .process-item, .review-card, .pricing-card, .contact-item, .about-card');
    revealElements.forEach(function(el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease ' + (i % 6) * 0.1 + 's, transform 0.6s ease ' + (i % 6) * 0.1 + 's';
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
    revealElements.forEach(function(el) { revealObserver.observe(el); });

    // ===== 导航高亮 =====
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
                    if (link.getAttribute('href') === '#' + id) link.classList.add('active');
                });
            }
        });
    });

    // ===== 返回顶部按钮 =====
    var scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:44px;height:44px;border-radius:50%;border:none;background:var(--text);color:var(--bg);font-size:18px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s;z-index:999;display:flex;align-items:center;justify-content:center;';
    document.body.appendChild(scrollTopBtn);
    scrollTopBtn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function() {
        scrollTopBtn.style.opacity = window.scrollY > 500 ? '1' : '0';
        scrollTopBtn.style.visibility = window.scrollY > 500 ? 'visible' : 'hidden';
    });

    // ===== 滚动进度条 =====
    var scrollProgress = document.createElement('div');
    scrollProgress.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--primary),var(--secondary));z-index:1001;transition:width 0.1s;width:0';
    document.body.appendChild(scrollProgress);
    window.addEventListener('scroll', function() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (scrollTop / docHeight * 100) + '%';
    });

    // ===== 通知功能 =====
    function showNotification(message, type) {
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();
        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(function() { if (notification.parentNode) notification.remove(); }, 3000);
    }
    window.showNotification = showNotification;

    // ===== 水波纹效果 =====
    document.addEventListener('click', function(e) {
        var ripple = document.createElement('div');
        ripple.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:0;height:0;border-radius:50%;pointer-events:none;z-index:9999;background:radial-gradient(circle,rgba(255,107,157,0.3),transparent);transform:translate(-50%,-50%);animation:rippleAnim 0.6s ease-out forwards;';
        document.body.appendChild(ripple);
        setTimeout(function() { ripple.remove(); }, 600);
    });
    var rippleStyle = document.createElement('style');
    rippleStyle.textContent = '@keyframes rippleAnim{to{width:200px;height:200px;opacity:0}}';
    document.head.appendChild(rippleStyle);

    // ===== 页面跳转动画 =====
    var transition = document.createElement('div');
    transition.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:var(--bg);z-index:9999;transform:scaleY(0);transform-origin:top;transition:transform 0.4s ease;pointer-events:none;';
    document.body.appendChild(transition);

    // 只对导航链接添加过渡动画，不对作品集按钮添加
    document.querySelectorAll('.nav-link[href$=".html"], .mobile-menu a[href$=".html"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var href = this.getAttribute('href');
            transition.style.transform = 'scaleY(1)';
            setTimeout(function() { window.location.href = href; }, 400);
        });
    });
});