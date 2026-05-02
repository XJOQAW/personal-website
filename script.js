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
                var img = portfolioItem.querySelector('.portfolio-img');
                var placeholder = portfolioItem.querySelector('.image-placeholder');

                modal.querySelector('.modal-title').textContent = title;
                modal.querySelector('.modal-description').textContent = description;
                
                // 设置图片
                var modalImg = modal.querySelector('.modal-img');
                if (img) {
                    modalImg.src = img.src;
                    modalImg.alt = title;
                    modalImg.style.display = 'block';
                } else if (placeholder) {
                    // 如果是占位符，显示占位符信息
                    modalImg.src = '';
                    modalImg.alt = placeholder.querySelector('p').textContent;
                    modalImg.style.display = 'none';
                }
                
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

    // 价格套餐标签页切换
    var pricingTabs = document.querySelectorAll('.pricing-tab');
    var pricingPanels = document.querySelectorAll('.pricing-panel');

    if (pricingTabs.length > 0) {
        pricingTabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var targetPanel = this.getAttribute('data-tab');
                
                // 更新标签状态
                pricingTabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                
                // 更新面板显示
                pricingPanels.forEach(function(panel) { panel.classList.remove('active'); });
                document.getElementById('panel-' + targetPanel).classList.add('active');
            });
        });
    }

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
                var pricingPanel = this.closest('.pricing-panel');
                if (pricingCard && pricingPanel) {
                    var packageName = pricingCard.querySelector('.pricing-title').textContent;
                    var panelId = pricingPanel.id;
                    var packageType = panelId === 'panel-studio' ? '白棚正片' : '场照';
                    
                    // 自动选择套餐
                    var packageSelect = document.querySelector('select[name="package"]');
                    if (packageSelect) {
                        var targetValue = packageType + '-' + packageName;
                        for (var i = 0; i < packageSelect.options.length; i++) {
                            if (packageSelect.options[i].value.indexOf(targetValue) !== -1) {
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

    // 联系表单 - Web3Forms提交 + 支付流程
    var contactForm = document.getElementById('contactForm');
    var paymentModal = document.getElementById('paymentModal');
    var successModal = document.getElementById('successModal');
    var closePaymentModal = document.getElementById('closePaymentModal');
    var confirmPayment = document.getElementById('confirmPayment');
    var cancelPayment = document.getElementById('cancelPayment');
    var closeSuccessModal = document.getElementById('closeSuccessModal');
    
    // 安全：记录表单加载时间
    var formLoadTime = Date.now();
    var formLoadTimeField = document.getElementById('formLoadTime');
    if (formLoadTimeField) {
        formLoadTimeField.value = formLoadTime;
    }
    
    // 安全：频率限制（5分钟内不能重复提交）
    var lastSubmitTime = localStorage.getItem('lastSubmitTime') || 0;
    var SUBMIT_COOLDOWN = 5 * 60 * 1000; // 5分钟
    
    // 套餐信息
    var packageInfo = {
        '白棚正片-基础套餐 ¥150': { name: '白棚正片-基础套餐', price: '¥150', description: '2小时拍摄，1套服装造型，1张精修', qrImage: 'images/pay-150.jpg' },
        '白棚正片-标准套餐 ¥350': { name: '白棚正片-标准套餐', price: '¥350', description: '4小时拍摄，1套服装造型，3张精修', qrImage: 'images/pay-350.jpg' },
        '白棚正片-高级套餐 ¥550': { name: '白棚正片-高级套餐', price: '¥550', description: '全天拍摄，所有服装造型，每套3张精修', qrImage: 'images/pay-550.jpg' },
        '场照-基础套餐 ¥21': { name: '场照-基础套餐', price: '¥21', description: '单张精修，有动作参考和指导', qrImage: 'images/pay-21.jpg' },
        '场照-标准套餐 ¥80': { name: '场照-标准套餐', price: '¥80', description: '四图，精修4张，有动作参考和指导', qrImage: 'images/pay-80.jpg' },
        '场照-高级套餐 ¥190': { name: '场照-高级套餐', price: '¥190', description: '12张图保9张，精修3张，全方位策划与指导', qrImage: 'images/pay-190.jpg' }
    };
    
    var currentFormData = null;
    var screenshotUploaded = false;

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 安全检查1：蜜罐字段 - 如果被填写说明是机器人
            var honeypot = contactForm.querySelector('input[name="honeypot"]');
            if (honeypot && honeypot.value) {
                showNotification('提交失败，请重试', 'error');
                return;
            }
            
            // 安全检查2：时间检测 - 表单加载后3秒内提交说明是机器人
            var currentTime = Date.now();
            var timeDiff = currentTime - formLoadTime;
            if (timeDiff < 3000) {
                showNotification('请仔细填写信息后再提交', 'error');
                return;
            }
            
            // 安全检查3：频率限制 - 5分钟内不能重复提交
            if (currentTime - lastSubmitTime < SUBMIT_COOLDOWN) {
                var remainingTime = Math.ceil((SUBMIT_COOLDOWN - (currentTime - lastSubmitTime)) / 1000);
                showNotification('请等待' + remainingTime + '秒后再提交', 'error');
                return;
            }
            
            // 获取套餐信息
            var packageSelect = contactForm.querySelector('select[name="套餐选择"]');
            var selectedPackage = packageSelect.value;
            
            if (!selectedPackage) {
                showNotification('请选择套餐后再提交', 'error');
                return;
            }
            
            // 更新最后提交时间
            lastSubmitTime = currentTime;
            localStorage.setItem('lastSubmitTime', currentTime);
            
            // 保存表单数据
            currentFormData = new FormData(contactForm);
            
            // 显示支付模态框
            var info = packageInfo[selectedPackage];
            if (info) {
                document.getElementById('paymentPackageName').textContent = info.name;
                document.getElementById('paymentPrice').textContent = info.price;
                document.getElementById('paymentDescription').textContent = info.description;
                document.getElementById('paymentQRCode').src = info.qrImage;
            }
            
            // 重置上传状态
            screenshotUploaded = false;
            document.getElementById('uploadPreview').style.display = 'none';
            document.getElementById('uploadArea').style.display = 'block';
            document.getElementById('confirmPayment').disabled = true;
            
            paymentModal.classList.add('active');
            document.body.classList.add('modal-open');
        });
    }
    
    // 文件上传功能
    var uploadArea = document.getElementById('uploadArea');
    var paymentScreenshot = document.getElementById('paymentScreenshot');
    var uploadPreview = document.getElementById('uploadPreview');
    var previewImage = document.getElementById('previewImage');
    var removeScreenshot = document.getElementById('removeScreenshot');
    
    if (uploadArea && paymentScreenshot) {
        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', function() {
            paymentScreenshot.click();
        });
        
        // 拖拽上传
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'rgba(255, 107, 157, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.style.borderColor = 'var(--bg-dark)';
            uploadArea.style.background = 'var(--bg-light)';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--bg-dark)';
            uploadArea.style.background = 'var(--bg-light)';
            
            if (e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });
        
        // 文件选择变化
        paymentScreenshot.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleFile(this.files[0]);
            }
        });
        
        // 处理文件
        function handleFile(file) {
            if (!file.type.startsWith('image/')) {
                showNotification('请上传图片文件', 'error');
                return;
            }
            
            var reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                uploadArea.style.display = 'none';
                uploadPreview.style.display = 'block';
                screenshotUploaded = true;
                document.getElementById('confirmPayment').disabled = false;
            };
            reader.readAsDataURL(file);
        }
        
        // 移除截图
        if (removeScreenshot) {
            removeScreenshot.addEventListener('click', function() {
                paymentScreenshot.value = '';
                previewImage.src = '';
                uploadArea.style.display = 'block';
                uploadPreview.style.display = 'none';
                screenshotUploaded = false;
                document.getElementById('confirmPayment').disabled = true;
            });
        }
    }
    
    // 关闭支付模态框
    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', function() {
            paymentModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    }
    
    // 取消支付
    if (cancelPayment) {
        cancelPayment.addEventListener('click', function() {
            paymentModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    }
    
    // 确认付款
    if (confirmPayment) {
        confirmPayment.addEventListener('click', function() {
            if (!screenshotUploaded) {
                showNotification('请先上传付款截图', 'error');
                return;
            }
            
            // 验证交易单号
            var transactionId = document.getElementById('transactionId').value.trim();
            if (!transactionId) {
                showNotification('请填写交易单号', 'error');
                return;
            }
            
            // 二次确认
            var packageName = document.getElementById('paymentPackageName').textContent;
            var price = document.getElementById('paymentPrice').textContent;
            if (!confirm('请确认您已支付 ' + price + '（' + packageName + '）？')) {
                return;
            }
            
            confirmPayment.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
            confirmPayment.disabled = true;
            
            // 记录付款时间
            var now = new Date();
            var paymentTimeStr = now.getFullYear() + '-' + 
                String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                String(now.getDate()).padStart(2, '0') + ' ' + 
                String(now.getHours()).padStart(2, '0') + ':' + 
                String(now.getMinutes()).padStart(2, '0') + ':' + 
                String(now.getSeconds()).padStart(2, '0');
            document.getElementById('paymentTime').value = paymentTimeStr;
            
            // 添加截图到表单数据
            var screenshotFile = document.getElementById('paymentScreenshot').files[0];
            if (screenshotFile) {
                currentFormData.append('screenshot', screenshotFile);
            }
            
            // 更新隐藏字段
            currentFormData.set('付款时间', paymentTimeStr);
            
            // 发送邮件通知
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: currentFormData
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // 关闭支付模态框
                paymentModal.classList.remove('active');
                
                // 显示成功模态框
                successModal.classList.add('active');
                
                // 重置表单
                contactForm.reset();
                screenshotUploaded = false;
                document.getElementById('uploadPreview').style.display = 'none';
                document.getElementById('uploadArea').style.display = 'block';
            })
            .catch(function(error) {
                showNotification('提交失败，请直接联系我', 'error');
            })
            .finally(function() {
                confirmPayment.innerHTML = '<i class="fas fa-check"></i> 已完成付款并提交';
                confirmPayment.disabled = false;
            });
        });
    }
    
    // 关闭成功模态框
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', function() {
            successModal.classList.remove('active');
            document.body.classList.remove('modal-open');
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