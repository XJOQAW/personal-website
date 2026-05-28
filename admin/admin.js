// ===== 一方通行 管理后台 JS =====
var API = location.origin; // 同域
var TOKEN = localStorage.getItem('adminToken') || '';

// ===== 请求封装 =====
function api(method, path, body) {
    return fetch(API + path, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN },
        body: body ? JSON.stringify(body) : undefined
    }).then(function(r) { return r.json(); });
}

function notify(msg, type) {
    var el = document.createElement('div');
    el.className = 'notification';
    el.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:10px;z-index:9999;font-size:14px;animation:slideIn .3s;max-width:300px;';
    el.style.background = type === 'error' ? 'rgba(244,67,54,0.9)' : 'rgba(76,175,80,0.9)';
    el.style.color = '#fff';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function() { if (el.parentNode) el.remove(); }, 3000);
}

// ===== 登录 =====
function doLogin(e) {
    e.preventDefault();
    var account = document.getElementById('adminAccount').value.trim();
    var password = document.getElementById('adminPassword').value;
    if (!account || !password) { notify('请输入账号密码', 'error'); return; }

    api('POST', '/api/admin/login', { account: account, password: password })
        .then(function(data) {
            if (data.token) {
                TOKEN = data.token;
                localStorage.setItem('adminToken', TOKEN);
                showAdmin();
            } else if (data.error && data.error.includes('首次使用')) {
                if (confirm('首次使用，是否用当前输入的账号密码创建管理员？')) {
                    api('POST', '/api/admin/setup', { account: account, password: password, name: account })
                        .then(function(r) {
                            if (r.success) { notify('创建成功，请重新登录'); } else { notify(r.error, 'error'); }
                        }).catch(function() { notify('创建失败', 'error'); });
                }
            } else {
                notify(data.error || '登录失败', 'error');
            }
        })
        .catch(function() { notify('网络错误', 'error'); });
}

function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminLayout').style.display = 'none';
}

function showAdmin() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'flex';
    loadPage('dashboard');
}

// ===== 页面切换 =====
var currentPage = 'dashboard';
function loadPage(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    document.getElementById('page-' + page).classList.add('active');
    document.querySelector('[data-page="' + page + '"]').classList.add('active');

    switch(page) {
        case 'dashboard': loadDashboard(); break;
        case 'users': loadUsers(); break;
        case 'reviews': loadReviews(); break;
        case 'rescues': loadRescues(); break;
        case 'wishes': loadWishes(); break;
        case 'submissions': loadSubmissions(); break;
        case 'portfolio': loadPortfolio(); break;
        case 'orders': loadOrders(); break;
    }
}

// ===== 仪表盘 =====
function loadDashboard() {
    api('GET', '/api/admin/stats').then(function(data) {
        document.getElementById('statTotalViews').textContent = data.totalViews || 0;
        document.getElementById('statTodayViews').textContent = data.todayViews || 0;
        document.getElementById('statUsers').textContent = data.totalUsers || 0;
        document.getElementById('statReviews').textContent = data.totalReviews || 0;
        document.getElementById('statRescues').textContent = data.totalRescues || 0;
        document.getElementById('statWishes').textContent = data.totalWishes || 0;

        // 流量趋势图
        if (data.trend && data.trend.length) {
            var ctx = document.getElementById('trendChart').getContext('2d');
            if (window._trendChart) window._trendChart.destroy();
            window._trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.trend.map(function(t) { return t.date.substring(5); }),
                    datasets: [{
                        label: '访问量',
                        data: data.trend.map(function(t) { return t.count; }),
                        borderColor: '#ff6b9d',
                        backgroundColor: 'rgba(255,107,157,0.1)',
                        fill: true, tension: 0.4, pointRadius: 4,
                        pointBackgroundColor: '#ff6b9d'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0b0' } },
                        x: { grid: { display: false }, ticks: { color: '#a0a0b0' } }
                    }
                }
            });
        }

        // 热门页面
        if (data.hotPages && data.hotPages.length) {
            var maxCount = data.hotPages[0].count;
            document.getElementById('hotPages').innerHTML = data.hotPages.map(function(p) {
                var pct = Math.round((p.count / maxCount) * 100);
                return '<div class="hot-item"><div style="flex:1"><div class="hot-path">' + p.path + '</div><div class="hot-bar"><div class="hot-bar-fill" style="width:' + pct + '%"></div></div></div><div class="hot-count">' + p.count + '</div></div>';
            }).join('');
        }
    }).catch(function() { notify('加载统计失败', 'error'); });
}

// ===== 用户管理 =====
function loadUsers() {
    api('GET', '/api/admin/users').then(function(data) {
        var tbody = document.getElementById('usersBody');
        if (!data.users || !data.users.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:40px">暂无用户</td></tr>'; return; }
        tbody.innerHTML = data.users.map(function(u) {
            var status = u.banned ? '<span class="badge badge-danger">已禁用</span>' : '<span class="badge badge-success">正常</span>';
            var btn = '<button class="btn-sm ' + (u.banned ? 'btn-success' : 'btn-danger') + '" onclick="toggleBan(\'' + u.account + '\')">' + (u.banned ? '解禁' : '禁用') + '</button>';
            return '<tr><td>' + u.account + '</td><td>' + (u.name||'-') + '</td><td>' + (u.phone||'-') + '</td><td>' + status + '</td><td>' + btn + '</td></tr>';
        }).join('');
    });
}

function toggleBan(account) {
    api('POST', '/api/admin/users/ban', { account: account }).then(function(data) {
        notify(data.banned ? '已禁用' : '已解禁');
        loadUsers();
    });
}

// ===== 评论管理 =====
function loadReviews() {
    api('GET', '/api/admin/reviews').then(function(data) {
        var tbody = document.getElementById('reviewsBody');
        if (!data.reviews || !data.reviews.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:40px">暂无评论</td></tr>'; return; }
        tbody.innerHTML = data.reviews.map(function(r) {
            var del = '<button class="btn-sm btn-danger" onclick="deleteReview(' + r.id + ')">删除</button>';
            return '<tr><td>' + (r.nickname||'-') + '</td><td>' + '★'.repeat(r.avg||0) + '</td><td>' + (r.text||'').substring(0,30) + '</td><td>' + (r.time||'-') + '</td><td>' + (r.replyCount||0) + '</td><td>' + del + '</td></tr>';
        }).join('');
    });
}

function deleteReview(id) {
    if (!confirm('确定删除这条评论？')) return;
    api('DELETE', '/api/admin/reviews/' + id).then(function(data) {
        if (data.success) { notify('已删除'); loadReviews(); } else { notify(data.error, 'error'); }
    });
}

// ===== 救援管理 =====
function loadRescues() {
    api('GET', '/api/admin/rescues').then(function(data) {
        var tbody = document.getElementById('rescuesBody');
        if (!data.rescues || !data.rescues.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:40px">暂无投稿</td></tr>'; return; }
        tbody.innerHTML = data.rescues.map(function(r) {
            var status = r.fixed ? '<span class="badge badge-success">已修复</span>' : '<span class="badge badge-warning">待处理</span>';
            var fix = r.fixed ? '' : '<button class="btn-sm btn-success" onclick="fixRescue(' + r.id + ')">标记修复</button>';
            return '<tr><td>' + (r.authorId||'-') + '</td><td>' + (r.cn||'-') + '</td><td>' + (r.desc||'').substring(0,30) + '</td><td>' + status + '</td><td>' + fix + '</td></tr>';
        }).join('');
    });
}

function fixRescue(id) {
    api('POST', '/api/admin/rescues/' + id + '/fix').then(function(data) {
        if (data.success) { notify('已标记修复'); loadRescues(); }
    });
}

// ===== 许愿池 =====
function loadWishes() {
    api('GET', '/api/admin/wishes').then(function(data) {
        var tbody = document.getElementById('wishesBody');
        if (!data.wishes || !data.wishes.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:40px">暂无许愿</td></tr>'; return; }
        tbody.innerHTML = data.wishes.map(function(w) {
            var del = '<button class="btn-sm btn-danger" onclick="deleteWish(' + w.id + ')">删除</button>';
            return '<tr><td>' + (w.authorName||w.authorId||'-') + '</td><td>' + (w.name||'-') + '</td><td>' + (w.votes||0) + '</td><td>' + (w.time||'-') + '</td><td>' + del + '</td></tr>';
        }).join('');
    });
}

function deleteWish(id) {
    if (!confirm('确定删除？')) return;
    api('DELETE', '/api/admin/wishes/' + id).then(function(data) {
        if (data.success) { notify('已删除'); loadWishes(); }
    });
}

// ===== 共创投稿 =====
function loadSubmissions() {
    api('GET', '/api/admin/submissions').then(function(data) {
        var tbody = document.getElementById('submissionsBody');
        if (!data.submissions || !data.submissions.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:40px">暂无投稿</td></tr>'; return; }
        tbody.innerHTML = data.submissions.map(function(s) {
            var del = '<button class="btn-sm btn-danger" onclick="deleteSubmission(' + s.id + ')">删除</button>';
            return '<tr><td>' + (s.name||'-') + '</td><td>' + (s.douyin||'-') + '</td><td>' + (s.contact||'-') + '</td><td>' + (s.works||'-').substring(0,20) + '</td><td>' + (s.time||'-') + '</td><td>' + del + '</td></tr>';
        }).join('');
    });
}

function deleteSubmission(id) {
    if (!confirm('确定删除？')) return;
    api('DELETE', '/api/admin/submissions/' + id).then(function(data) {
        if (data.success) { notify('已删除'); loadSubmissions(); }
    });
}

// ===== 作品集 =====
var currentCat = 'portrait';
function loadPortfolio() {
    api('GET', '/api/admin/portfolio').then(function(data) {
        var cats = data.portfolio || {};
        var catNames = { portrait:'人像', creative:'创意', event:'场照', scene:'场景' };
        document.getElementById('portfolioCats').innerHTML = Object.keys(catNames).map(function(c) {
            return '<button class="portfolio-cat-btn ' + (c === currentCat ? 'active' : '') + '" onclick="switchCat(\'' + c + '\')">' + catNames[c] + '</button>';
        }).join('');
        renderCatImages(cats[currentCat] || []);
    });
}

function switchCat(cat) {
    currentCat = cat;
    api('GET', '/api/admin/portfolio').then(function(data) {
        renderCatImages((data.portfolio || {})[cat] || []);
    });
}

function renderCatImages(files) {
    document.getElementById('portfolioGrid').innerHTML = files.map(function(f) {
        return '<div class="portfolio-item"><img src="https://yifangtx.xyz/images/' + currentCat + '/' + f + '" loading="lazy"><div class="del-overlay"><button onclick="deleteImage(\'' + f + '\')">删除</button></div></div>';
    }).join('') || '<p style="color:var(--text-secondary)">暂无图片</p>';
}

function deleteImage(filename) {
    if (!confirm('确定删除 ' + filename + '？')) return;
    api('POST', '/api/admin/portfolio/delete', { category: currentCat, filename: filename }).then(function(data) {
        if (data.success) { notify('已删除'); loadPortfolio(); }
    });
}

// ===== 订单管理 =====
function loadOrders() {
    api('GET', '/api/admin/orders').then(function(data) {
        var tbody = document.getElementById('ordersBody');
        if (!data.orders || !data.orders.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:40px">暂无订单</td></tr>'; return; }
        tbody.innerHTML = data.orders.map(function(o) {
            var statusClass = o.status === '已完成' ? 'badge-success' : o.status === '已取消' ? 'badge-danger' : 'badge-warning';
            var actions = '<button class="btn-sm btn-success" onclick="updateOrderStatus(' + o.id + ',\'已完成\')">完成</button><button class="btn-sm btn-warning" onclick="updateOrderStatus(' + o.id + ',\'已取消\')">取消</button>';
            return '<tr><td>' + (o.nickname||'-') + '</td><td>' + (o.package||'-') + '</td><td>' + (o.price||'-') + '</td><td><span class="badge ' + statusClass + '">' + (o.status||'待处理') + '</span></td><td>' + (o.time||'-') + '</td><td>' + actions + '</td></tr>';
        }).join('');
    });
}

function updateOrderStatus(id, status) {
    api('PATCH', '/api/admin/orders/' + id + '/status', { status: status }).then(function(data) {
        if (data.success) { notify('已更新'); loadOrders(); }
    });
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    // 登录表单
    document.getElementById('loginForm').addEventListener('submit', doLogin);
    // 退出
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        TOKEN = '';
        localStorage.removeItem('adminToken');
        showLogin();
    });
    // 侧边栏导航
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            loadPage(this.getAttribute('data-page'));
        });
    });
    // 搜索过滤
    document.getElementById('userSearch').addEventListener('input', function() {
        var q = this.value.toLowerCase();
        document.querySelectorAll('#usersBody tr').forEach(function(tr) {
            tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });
    document.getElementById('reviewSearch').addEventListener('input', function() {
        var q = this.value.toLowerCase();
        document.querySelectorAll('#reviewsBody tr').forEach(function(tr) {
            tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });

    // 检查是否已登录
    if (TOKEN) {
        api('POST', '/api/admin/verify', { token: TOKEN }).then(function(data) {
            if (data.valid) { showAdmin(); } else { TOKEN = ''; localStorage.removeItem('adminToken'); showLogin(); }
        }).catch(function() { showLogin(); });
    } else {
        showLogin();
    }
});

// 动画
var style = document.createElement('style');
style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
document.head.appendChild(style);
