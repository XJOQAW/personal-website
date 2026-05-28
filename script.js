// 主脚本
function initApp() {
    console.log('页面加载完成');

    // ===== 开屏动画 =====
    // 检查本地登录
    checkLocalAuth();
    var splash = document.getElementById('splash');
    if (splash) {
        // 检查是否已经看过开屏动画
        if (localStorage.getItem('splashShown')) {
            splash.style.display = 'none';
        } else {
            setTimeout(function() { splash.classList.add('show-text'); }, 300);
            setTimeout(function() {
                splash.style.opacity = '0';
                splash.style.pointerEvents = 'none';
                splash.style.visibility = 'hidden';
                localStorage.setItem('splashShown', 'true');
            }, 2800);
        }
    }

    // 处理返回页面（bfcache），防止白屏
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            var s = document.getElementById('splash');
            if (s) s.style.display = 'none';
        }
    });

    // ===== 导航栏滚动隐藏/显示 =====
    var nav = document.getElementById('nav');
    var lastScroll = 0;
    var navTimer = null;
    var navHoverZone = document.createElement('div');
    navHoverZone.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:15px;z-index:998;';
    document.body.appendChild(navHoverZone);

    // 初始显示导航栏
    nav.classList.add('visible');

    // 自动收回定时器
    function startAutoHide() {
        clearTimeout(navTimer);
        navTimer = setTimeout(function() {
            if (window.pageYOffset > 150) {
                nav.classList.remove('visible');
            }
        }, 3000);
    }

    window.addEventListener('scroll', function() {
        var currentScroll = window.pageYOffset;
        clearTimeout(navTimer);
        if (currentScroll < 100) {
            nav.classList.add('visible');
            nav.classList.add('at-top');
        } else {
            nav.classList.remove('at-top');
            if (currentScroll > lastScroll) {
                nav.classList.remove('visible');
            } else {
                nav.classList.add('visible');
            }
        }
        lastScroll = currentScroll;
        startAutoHide();
    });

    // 鼠标移到顶部或导航栏，显示并重置定时器
    navHoverZone.addEventListener('mouseenter', function() { nav.classList.add('visible'); clearTimeout(navTimer); });
    nav.addEventListener('mouseenter', function() { nav.classList.add('visible'); clearTimeout(navTimer); });
    nav.addEventListener('mouseleave', startAutoHide);

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

        // 自动轮播
        var autoPlay = setInterval(function() {
            goToSlide((currentIndex + 1) % slides.length);
        }, 4000);

        // 鼠标悬停暂停
        track.parentElement.addEventListener('mouseenter', function() { clearInterval(autoPlay); });
        track.parentElement.addEventListener('mouseleave', function() {
            autoPlay = setInterval(function() {
                goToSlide((currentIndex + 1) % slides.length);
            }, 4000);
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
            var name = card.querySelector('h3').textContent.trim();
            var contactSection = document.getElementById('contact');
            if (!contactSection) return;
            contactSection.scrollIntoView({ behavior: 'smooth' });

            // 判断是白棚正片还是场照
            var parentGrid = card.closest('.pricing-grid');
            var isStudio = parentGrid && parentGrid.id === 'studioPricing';
            var serviceType = isStudio ? 'cosplay白棚拍摄' : '漫展场照拍摄';
            var packagePrefix = isStudio ? '白棚正片' : '场照';

            // 服务类型
            var serviceSelect = document.querySelector('select[name="服务类型"]');
            if (serviceSelect) {
                for (var i = 0; i < serviceSelect.options.length; i++) {
                    if (serviceSelect.options[i].value === serviceType) {
                        serviceSelect.selectedIndex = i;
                        break;
                    }
                }
            }

            // 套餐
            var packageSelect = document.querySelector('select[name="套餐选择"]');
            if (packageSelect) {
                var expected = packagePrefix + '-' + name;
                for (var i = 0; i < packageSelect.options.length; i++) {
                    if (packageSelect.options[i].value.indexOf(expected) !== -1) {
                        packageSelect.selectedIndex = i;
                        break;
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

    // ===== 我的订单 =====
    var ordersNavLink = document.querySelector('.nav-link[href="#orders"]');
    var ordersModal = document.getElementById('ordersModal');
    if (ordersNavLink && ordersModal) {
        ordersNavLink.addEventListener('click', function(e) {
            e.preventDefault();
            ordersModal.classList.add('active');
        });
    }

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

    // ===== 账号模态框 =====
    var accountModal = document.getElementById('accountModal');
    var accountClose = document.getElementById('accountClose');
    var userInfoBtn = document.getElementById('userInfoBtn');

    function openAccount() {
        if (accountModal) {
            accountModal.classList.add('active');
            updateAccountInfo();
        }
    }
    function closeAccount() { if (accountModal) accountModal.classList.remove('active'); }

    if (userInfoBtn) userInfoBtn.addEventListener('click', openAccount);

    // 退出登录按钮
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentUserName');
            showNotification('已退出登录', 'success');
            setTimeout(function() { location.reload(); }, 300);
        });
    }
    if (accountClose) accountClose.addEventListener('click', closeAccount);
    if (accountModal) accountModal.addEventListener('click', function(e) { if (e.target === accountModal) closeAccount(); });

    // 更新账号信息
    function updateAccountInfo() {
        var avatarEl = document.getElementById('accountAvatar');
        var navAvatar = document.getElementById('userAvatar');
        var currentName = localStorage.getItem('currentUserName') || '用户';
        var currentUser = localStorage.getItem('currentUser') || '';
        document.getElementById('accountName').textContent = currentName;
        
        var savedAvatarImg = localStorage.getItem('userAvatarImg');
        var savedAvatar = localStorage.getItem('userAvatar');
        var currentUserForAvatar = localStorage.getItem('currentUser') || '';

        var svrAvatar = currentUserForAvatar ? (WORKER_API + '/api/auth/avatar?account=' + currentUserForAvatar + '&t=' + Date.now()) : '';
        if (currentUserForAvatar && svrAvatar) {
            var img = new Image();
            img.onload = function() {
                avatarEl.innerHTML = '<img src="' + svrAvatar + '">';
                if (navAvatar) navAvatar.innerHTML = '<img src="' + svrAvatar + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
            };
            img.onerror = function() { showLocalAvatar(); };
            img.src = svrAvatar;
        } else {
            showLocalAvatar();
        }

        function showLocalAvatar() {
            if (savedAvatarImg) {
                avatarEl.innerHTML = '<img src="' + savedAvatarImg + '">';
                if (navAvatar) navAvatar.innerHTML = '<img src="' + savedAvatarImg + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
            } else if (savedAvatar) {
                avatarEl.textContent = savedAvatar;
                if (navAvatar) navAvatar.textContent = savedAvatar;
            } else {
                avatarEl.textContent = currentName.charAt(0).toUpperCase();
            }
        }
        // 加载点赞记录
        var likedItems = JSON.parse(localStorage.getItem('likedReviews') || '[]');
        var likesList = document.getElementById('likesList');
        if (likedItems.length > 0) {
            likesList.innerHTML = likedItems.map(function(id) {
                return '<div class="account-list-item"><i class="fas fa-heart" style="color:var(--primary)"></i> 评价 #' + id + '</div>';
            }).join('');
        } else {
            likesList.innerHTML = '<p class="account-empty">暂无点赞记录</p>';
        }
        // 加载咨询记录
        var orders = JSON.parse(localStorage.getItem('consultations') || '[]');
        var ordersList = document.getElementById('ordersList');
        if (orders.length > 0) {
            ordersList.innerHTML = orders.map(function(order) {
                return '<div class="account-list-item"><strong>' + order.service + '</strong> - ' + order.package + '<br><small>' + order.time + '</small></div>';
            }).join('');
        } else {
            ordersList.innerHTML = '<p class="account-empty">暂无咨询记录</p>';
        }
    }

    // 账号标签页切换
    document.querySelectorAll('.account-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.account-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            var target = this.getAttribute('data-tab');
            document.querySelectorAll('.account-panel').forEach(function(p) { p.classList.remove('active'); });
            document.getElementById('panel-' + target).classList.add('active');
        });
    });

    // 头像预设选择
    document.querySelectorAll('.avatar-option').forEach(function(option) {
        option.addEventListener('click', function() {
            document.querySelectorAll('.avatar-option').forEach(function(o) { o.classList.remove('selected'); });
            this.classList.add('selected');
            var avatar = this.getAttribute('data-avatar');
            var avatarEl = document.getElementById('accountAvatar');
            avatarEl.textContent = avatar;
            // 保存到localStorage
            localStorage.setItem('userAvatar', avatar);
            // 更新导航栏头像
            var navAvatar = document.getElementById('userAvatar');
            if (navAvatar) navAvatar.textContent = avatar;
        });
    });

    // 头像上传
    var avatarUpload = document.getElementById('avatarUpload');
    var avatarEditBtn = document.getElementById('avatarEditBtn');
    if (avatarEditBtn) {
        avatarEditBtn.addEventListener('click', function() { avatarUpload.click(); });
    }
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var avatarEl = document.getElementById('accountAvatar');
                    avatarEl.innerHTML = '<img src="' + e.target.result + '">';
                    localStorage.setItem('userAvatarImg', e.target.result);
                    var uid = localStorage.getItem('currentUser') || '';
                    if (uid) {
                        fetch(WORKER_API + '/api/auth/avatar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ account: uid, data: e.target.result })
                        }).catch(function(){});
                    }
                    var navAvatar = document.getElementById('userAvatar');
                    if (navAvatar) navAvatar.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // 保存个人资料
    var profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('profileName').value;
            var bio = document.getElementById('profileBio').value;
            localStorage.setItem('currentUserName', name);
            localStorage.setItem('userBio', bio);
            document.getElementById('userName').textContent = name;
            document.getElementById('accountName').textContent = name;
            showNotification('资料保存成功！', 'success');
        });
    }

    // 修改密码
    var changePasswordBtn = document.getElementById('changePasswordBtn');
    var passwordModal = document.getElementById('passwordModal');
    var passwordClose = document.getElementById('passwordClose');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() { passwordModal.classList.add('active'); });
    }
    if (passwordClose) {
        passwordClose.addEventListener('click', function() { passwordModal.classList.remove('active'); });
    }
    if (passwordModal) {
        passwordModal.addEventListener('click', function(e) { if (e.target === passwordModal) passwordModal.classList.remove('active'); });
    }
    var passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var oldPwd = document.getElementById('oldPassword').value;
            var newPwd = document.getElementById('newPassword').value;
            var confirmPwd = document.getElementById('confirmNewPassword').value;
            if (newPwd !== confirmPwd) { showNotification('两次密码不一致', 'error'); return; }
            var acc = localStorage.getItem('currentUser') || '';
            fetch(WORKER_API + '/api/auth/changepwd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account: acc, oldPassword: oldPwd, newPassword: newPwd })
            }).then(function(r) { return r.json(); }).then(function(data) {
                if (data.success) {
                    showNotification('密码修改成功！', 'success');
                    passwordModal.classList.remove('active');
                } else {
                    showNotification(data.error || '修改失败', 'error');
                }
            }).catch(function() { showNotification('网络错误', 'error'); });
        });
    }

    // 设置页深色模式切换
    var settingsDarkMode = document.getElementById('settingsDarkMode');
    if (settingsDarkMode) {
        settingsDarkMode.addEventListener('click', function() {
            var html = document.documentElement;
            var current = html.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            this.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            var themeBtn = document.getElementById('themeBtn');
            if (themeBtn) themeBtn.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // 设置页退出登录
    var settingsLogout = document.getElementById('settingsLogout');
    if (settingsLogout) {
        settingsLogout.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentUserName');
            closeAccount();
            showNotification('已退出登录', 'success');
            setTimeout(function() { location.reload(); }, 300);
        });
    }

    // 加载保存的头像（优先服务器）
    var savedAvatar = localStorage.getItem('userAvatar');
    var savedAvatarImg = localStorage.getItem('userAvatarImg');
    var navAvatar = document.getElementById('userAvatar');
    var currentUserForNav = localStorage.getItem('currentUser') || '';
    if (currentUserForNav && navAvatar) {
        var navImg = new Image();
        navImg.onload = function() { navAvatar.innerHTML = '<img src="' + navImg.src + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">'; };
        navImg.onerror = function() {
            if (savedAvatarImg) navAvatar.innerHTML = '<img src="' + savedAvatarImg + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
            else if (savedAvatar) navAvatar.textContent = savedAvatar;
        };
        navImg.src = WORKER_API + '/api/auth/avatar?account=' + currentUserForNav + '&t=' + Date.now();
    } else if (savedAvatarImg && navAvatar) {
        navAvatar.innerHTML = '<img src="' + savedAvatarImg + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
    } else if (savedAvatar && navAvatar) {
        navAvatar.textContent = savedAvatar;
    }
    // ===== 联系表单 + 支付流程 =====
    var contactForm = document.getElementById('contactForm');
    var paymentModal = document.getElementById('paymentModal');
    var pendingFormData = null;
    var screenshotUploaded = false;

    var packageInfo = {
        '白棚正片-基础套餐 ¥150': { name: '基础套餐', price: '¥150', qr: 'images/pay-150.jpg' },
        '白棚正片-标准套餐 ¥350': { name: '标准套餐', price: '¥350', qr: 'images/pay-350.jpg' },
        '白棚正片-高级套餐 ¥550': { name: '高级套餐', price: '¥550', qr: 'images/pay-550.jpg' },
        '场照-基础套餐 ¥21': { name: '基础套餐', price: '¥21', qr: 'images/pay-21.jpg' },
        '场照-标准套餐 ¥80': { name: '标准套餐', price: '¥80', qr: 'images/pay-80.jpg' },
        '场照-高级套餐 ¥190': { name: '高级套餐', price: '¥190', qr: 'images/pay-190.jpg' }
    };

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            pendingFormData = new FormData(contactForm);
            var pkg = contactForm.querySelector('select[name="套餐选择"]').value;
            if (!pkg) { showNotification('请先选择套餐', 'error'); return; }

            var info = packageInfo[pkg];
            if (!info) { showNotification('请先选择套餐', 'error'); return; }

            document.getElementById('paymentPackageName').textContent = info.name;
            document.getElementById('paymentPrice').textContent = info.price;
            document.getElementById('paymentQRCode').src = info.qr;
            
            // 重置上传
            screenshotUploaded = false;
            document.getElementById('uploadArea').style.display = 'block';
            document.getElementById('uploadPreview').style.display = 'none';
            document.getElementById('confirmPayment').disabled = true;
            document.getElementById('transactionId').value = '';

            paymentModal.classList.add('active');
        });
    }

    // 文件上传
    var uploadArea = document.getElementById('uploadArea');
    var paymentScreenshot = document.getElementById('paymentScreenshot');
    if (uploadArea && paymentScreenshot) {
        uploadArea.addEventListener('click', function() { paymentScreenshot.click(); });
        paymentScreenshot.addEventListener('change', function() {
            if (this.files[0]) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('previewImage').src = e.target.result;
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('uploadPreview').style.display = 'block';
                    screenshotUploaded = true;
                    document.getElementById('confirmPayment').disabled = false;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    var removeBtn = document.getElementById('removeScreenshot');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            paymentScreenshot.value = '';
            document.getElementById('uploadArea').style.display = 'block';
            document.getElementById('uploadPreview').style.display = 'none';
            screenshotUploaded = false;
            document.getElementById('confirmPayment').disabled = true;
        });
    }

    // 确认付款
    var confirmBtn = document.getElementById('confirmPayment');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (!screenshotUploaded) return;
            var tid = document.getElementById('transactionId').value;
            if (!tid) { showNotification('请填写交易单号', 'error'); return; }
            if (!confirm('确认已支付 ' + document.getElementById('paymentPrice').textContent + ' ？')) return;

            var params = {
                from_name: '一方通行网站',
                cn: pendingFormData.get('CN') || '',
                qq: pendingFormData.get('QQ') || '',
                wechat: pendingFormData.get('微信') || '',
                service_type: pendingFormData.get('服务类型') || '',
                package: pendingFormData.get('套餐选择') || '',
                message: pendingFormData.get('需求描述') || '',
                transaction_id: tid,
                subject: '一方通行 - 新预约咨询'
            };

            if (typeof emailjs !== 'undefined') {
                emailjs.init('REGKsKT8zEFNRHyBQ');
                emailjs.send('service_ze9zcfx', 'template_tiii15a', params)
                    .then(function() {
                        paymentModal.classList.remove('active');
                        showNotification('提交成功！我会在24小时内回复您。', 'success');
                        var orders = JSON.parse(localStorage.getItem('consultations') || '[]');
                        orders.unshift({ service: params.service_type, package: params.package, time: new Date().toLocaleString('zh-CN') });
                        localStorage.setItem('consultations', JSON.stringify(orders));
                        contactForm.reset();
                    })
                    .catch(function(err) {
                        paymentModal.classList.remove('active');
                        showNotification('提交失败，请稍后重试', 'error');
                        console.error('EmailJS Error:', err);
                    });
            } else {
                showNotification('邮件服务未加载，请刷新页面', 'error');
            }
        });
    }

    // 关闭支付模态框
    var closePayment = document.getElementById('closePaymentModal');
    if (closePayment) closePayment.addEventListener('click', function() { paymentModal.classList.remove('active'); });
    if (paymentModal) paymentModal.addEventListener('click', function(e) { if (e.target === paymentModal) paymentModal.classList.remove('active'); });

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
            if (this.closest('a[href]')) return;
            var img = this.querySelector('img');
            var title = this.querySelector('h3');
            var desc = this.querySelector('p');
            var modal = document.getElementById('portfolioModal');
            if (!modal || !title || !desc) return;
            document.getElementById('modalTitle').textContent = title.textContent;
            document.getElementById('modalDesc').textContent = desc.textContent;
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

    // ===== 作品集自动轮播 =====
    var showcaseTrack = document.getElementById('showcaseTrack');
    var showcaseDots = document.getElementById('showcaseDots');
    var showcaseProgress = document.getElementById('showcaseProgress');
    if (showcaseTrack && showcaseDots) {
        var slides = showcaseTrack.querySelectorAll('.showcase-slide');
        var currentSlide = 0;
        var autoPlayInterval = null;
        var progressInterval = null;
        var progress = 0;
        var slideDuration = 4000; // 4秒切换一次

        // 创建圆点
        slides.forEach(function(_, i) {
            var dot = document.createElement('button');
            dot.className = 'showcase-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', function() { goToSlide(i); });
            showcaseDots.appendChild(dot);
        });

        function goToSlide(index) {
            currentSlide = index;
            showcaseTrack.style.transform = 'translateX(-' + (index * 100) + '%)';
            showcaseDots.querySelectorAll('.showcase-dot').forEach(function(d, i) {
                d.classList.toggle('active', i === index);
            });
            resetProgress();
        }

        function nextSlide() {
            goToSlide((currentSlide + 1) % slides.length);
        }

        function prevSlide() {
            goToSlide((currentSlide - 1 + slides.length) % slides.length);
        }

        function resetProgress() {
            progress = 0;
            if (showcaseProgress) showcaseProgress.style.width = '0%';
        }

        function startAutoPlay() {
            stopAutoPlay();
            progress = 0;
            autoPlayInterval = setInterval(function() {
                progress += 50;
                if (showcaseProgress) showcaseProgress.style.width = (progress / slideDuration * 100) + '%';
                if (progress >= slideDuration) {
                    nextSlide();
                    progress = 0;
                }
            }, 50);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
        }

        // 按钮事件
        var prevBtn = document.getElementById('showcasePrev');
        var nextBtn = document.getElementById('showcaseNext');
        if (prevBtn) prevBtn.addEventListener('click', function() { prevSlide(); startAutoPlay(); });
        if (nextBtn) nextBtn.addEventListener('click', function() { nextSlide(); startAutoPlay(); });

        // 鼠标悬停暂停
        showcaseTrack.parentElement.addEventListener('mouseenter', stopAutoPlay);
        showcaseTrack.parentElement.addEventListener('mouseleave', startAutoPlay);

        // 启动自动播放
        startAutoPlay();
    }
}

// 显示退款表单
function showRefundForm() {
    document.getElementById('refundForm').style.display = 'block';
}
window.showRefundForm = showRefundForm;

// 提交退款
function submitRefund() {
    var reason = document.getElementById('refundReason').value;
    if (!reason.trim()) { showNotification('请填写退款原因', 'error'); return; }
    var formData = new FormData();
    formData.append('access_key', '08de3ce1-85fc-4b07-a2f3-bf778d80e8ea');
    formData.append('subject', '一方通行 - 退款申请');
    formData.append('from_name', '一方通行网站');
    formData.append('退款原因', reason);
    formData.append('订单编号', '001');
    fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                showNotification('退款申请已提交，请等待处理', 'success');
                document.getElementById('refundForm').style.display = 'none';
                document.getElementById('refundReason').value = '';
            } else { showNotification('提交失败', 'error'); }
        });
}
window.submitRefund = submitRefund;

// 催返图功能
function handleUrge() {
    var orderDate = new Date('2026-05-07');
    var today = new Date();
    var diffDays = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
        showNotification((7 - diffDays) + '天后可催返图', 'error');
        return;
    }
    
    if (localStorage.getItem('urgeSent')) {
        showNotification('已经催过返图啦~摄影正在火速加班！', 'success');
        return;
    }
    
    var formData = new FormData();
    formData.append('access_key', '08de3ce1-85fc-4b07-a2f3-bf778d80e8ea');
    formData.append('subject', '一方通行 - 催返图通知');
    formData.append('from_name', '一方通行网站');
    formData.append('催返提示', '客户催返图，请尽快处理订单 #001');
    fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    
    localStorage.setItem('urgeSent', 'true');
    showNotification('已催返图！摄影正在火速加班~', 'success');
}
window.handleUrge = handleUrge;

// 番剧二级菜单切换
document.querySelectorAll('.ref-cat').forEach(function(cat) {
    cat.addEventListener('click', function() {
        document.querySelectorAll('.ref-cat').forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
        var targetCat = this.getAttribute('data-cat');
        document.getElementById('animePanel').style.display = 'block';
        document.querySelectorAll('.ref-anime-grid').forEach(function(grid) {
            grid.classList.toggle('active', grid.getAttribute('data-cat') === targetCat);
        });
    });
});

// 参考标签点击
document.querySelectorAll('.ref-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
        document.querySelectorAll('.ref-tag').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        var gameName = this.textContent.trim();
        document.getElementById('referenceSearch').value = gameName;
        document.getElementById('searchResults').style.display = 'none';
        showGameChars(gameName);
    });
});

// 显示对应游戏/番剧角色
function showGameChars(gameName) {
    document.querySelectorAll('.char-group').forEach(function(group) {
        var groupGame = group.getAttribute('data-game');
        if (groupGame && gameName.indexOf(groupGame) !== -1) {
            group.style.display = 'block';
            group.scrollIntoView({ behavior: 'smooth' });
        } else if (!groupGame) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
}

// 搜索建议
var searchInput = document.getElementById('referenceSearch');
var suggestBox = document.getElementById('searchSuggestions');
var allCharNames = [];
document.querySelectorAll('.char-name').forEach(function(el) { allCharNames.push(el.textContent); });

if (searchInput && suggestBox) {
    searchInput.addEventListener('input', function() {
        var val = this.value.trim().toLowerCase();
        suggestBox.innerHTML = '';
        if (!val) { suggestBox.classList.remove('active'); return; }
        var matches = allCharNames.filter(function(n) { return n.toLowerCase().includes(val); });
        if (matches.length === 0) { suggestBox.classList.remove('active'); return; }
        matches.slice(0, 8).forEach(function(n) {
            var item = document.createElement('div');
            item.className = 'search-suggest-item';
            item.textContent = n;
            item.addEventListener('click', function() {
                searchInput.value = n;
                suggestBox.classList.remove('active');
                // 找到该角色所在的char-group并显示
                document.querySelectorAll('.char-card').forEach(function(card) {
                    var name = card.querySelector('.char-name').textContent;
                    if (name === n) {
                        document.querySelectorAll('.char-group').forEach(function(g) { g.style.display = 'none'; });
                        var group = card.closest('.char-group');
                        if (group) { group.style.display = 'block'; group.scrollIntoView({ behavior: 'smooth' }); }
                    }
                });
            });
            suggestBox.appendChild(item);
        });
        suggestBox.classList.add('active');
    });
    // 回车搜索
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            var val = this.value.trim();
            if (val) showGameChars(val);
            suggestBox.classList.remove('active');
        }
    });
    // 点击外部关闭建议
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestBox.contains(e.target)) {
            suggestBox.classList.remove('active');
        }
    });
}

// 自动执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}