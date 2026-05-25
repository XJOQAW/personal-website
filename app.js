// ===== 一方通行 核心共享模块 =====
var WORKER_API = 'https://yifangtx.xyz';

function esc(s) {
    var d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

function getCurrentUserId() {
    return localStorage.getItem('currentUser') || null;
}

function showNotification(message, type) {
    var existing = document.querySelector('.notification');
    if (existing) existing.remove();
    var notification = document.createElement('div');
    notification.className = 'notification notification-' + (type || 'success');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(function() { if (notification.parentNode) notification.remove(); }, 3000);
}

// ===== 一方通行 登录/注册模块（服务器账号系统） =====
function doLogin(e) {
    e.preventDefault();
    var acc = document.getElementById('loginAccount').value.trim();
    var pwd = document.getElementById('loginPassword').value;
    if (!acc || !pwd) { showNotification('请输入账号和密码', 'error'); return; }

    fetch(WORKER_API + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: acc, password: pwd })
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.account) {
            localStorage.setItem('currentUser', data.account);
            localStorage.setItem('currentUserName', data.name);
            var m = document.getElementById('loginModal');
            if (m) { m.style.opacity = '0'; m.style.visibility = 'hidden'; m.style.pointerEvents = 'none'; }
            updateLocalAuthUI();
            showNotification('登录成功！', 'success');
            setTimeout(function() { location.reload(); }, 300);
        } else {
            showNotification(data.error || '登录失败', 'error');
        }
    }).catch(function() {
        showNotification('网络错误，请稍后重试', 'error');
    });
}
window.doLogin = doLogin;

function doRegister(e) {
    e.preventDefault();
    var name = document.getElementById('registerName').value.trim();
    var acc = document.getElementById('registerAccount').value.trim();
    var pwd = document.getElementById('registerPassword').value;
    var cfm = document.getElementById('registerConfirm').value;
    if (!name || !acc) { showNotification('请填写用户名和账号', 'error'); return; }
    if (pwd !== cfm) { showNotification('两次密码不一致', 'error'); return; }
    if (pwd.length < 6) { showNotification('密码至少6位', 'error'); return; }

    fetch(WORKER_API + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, account: acc, password: pwd })
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.account) {
            localStorage.setItem('currentUser', data.account);
            localStorage.setItem('currentUserName', data.name);
            var m = document.getElementById('loginModal');
            if (m) { m.style.opacity = '0'; m.style.visibility = 'hidden'; m.style.pointerEvents = 'none'; }
            updateLocalAuthUI();
            showNotification('注册成功！', 'success');
            setTimeout(function() { location.reload(); }, 300);
        } else {
            showNotification(data.error || '注册失败', 'error');
        }
    }).catch(function() {
        showNotification('网络错误，请稍后重试', 'error');
    });
}
window.doRegister = doRegister;

function updateLocalAuthUI() {
    var authSection = document.getElementById('authSection');
    var userSection = document.getElementById('userSection');
    var userName = document.getElementById('userName');
    if (authSection) authSection.style.display = 'none';
    if (userSection) userSection.style.display = 'flex';
    if (userName) userName.textContent = localStorage.getItem('currentUserName') || '用户';
}

function checkLocalAuth() {
    var currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        updateLocalAuthUI();
    }
}

// ===== 评价持久化系统 =====
var REVIEWS_KEY = 'siteReviews';
var REPLIES_KEY = 'siteReplies';
var LIKED_KEY = 'likedReviews';


function getReviews() {
    try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]'); } catch(e) { return []; }
}
function saveReviews(reviews) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}
function getReplies() {
    try { return JSON.parse(localStorage.getItem(REPLIES_KEY) || '[]'); } catch(e) { return []; }
}
function saveReplies(replies) {
    localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
}

// ===== Worker API 数据同步辅助 =====
function workerSyncReplies(reviewId, replyData, action) {
    var uid = getCurrentUserId();
    if (!uid) return;
    var apiPath = WORKER_API + '/api/reviews/' + reviewId + '/replies';
    if (action === 'add') {
        fetch(apiPath, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(replyData) }).catch(function(){});
    }
}

function renderMainReviews(reviews) {
    var mainGrid = document.getElementById('reviewsMainGrid');
    if (!mainGrid) return;
    var currentId = getCurrentUserId();
    if (reviews.length === 0) {
        mainGrid.innerHTML = '<p class="account-empty">暂无评价，欢迎分享您的创作体验</p>';
    } else {
        mainGrid.innerHTML = reviews.map(function(r) {
            var starsStr = '★'.repeat(r.avg) + '☆'.repeat(5 - r.avg);
            var delBtn = (currentId && r.authorId && r.authorId === currentId) ? '<button class="review-delete-btn" data-review-id="' + r.id + '" title="删除评价"><i class="fas fa-trash-alt"></i></button>' : '';
            var replies = getRepliesForReview(r.id);
            var replyCount = replies.length;
            return '<div class="review-card" style="position:relative;" data-review-id="' + r.id + '"><div class="review-stars">' + starsStr + '</div><p class="review-text">"' + esc(r.text) + '"</p><div class="review-author"><span class="review-avatar">' + r.avatar + '</span><div><strong>' + esc(r.nickname) + '</strong><span>' + esc(r.identity) + '</span></div></div><span class="review-time-display">' + r.time + '</span><button class="reply-toggle-btn reply-go-modal" data-review-id="' + r.id + '"><i class="fas fa-reply"></i> 回复 (' + replyCount + ')</button>' + delBtn + '</div>';
        }).reverse().join('');
        attachDeleteHandlers();
        attachMainReplyHandlers();
    }
}

function renderReviewsList(reviews, sortType) {
    var list = document.getElementById('reviewsList');
    if (!list) return;
    var currentId = getCurrentUserId();
    var sorted = reviews.slice();
    if (sortType === 'latest') sorted.reverse();
    else if (sortType === 'hottest') sorted.sort(function(a,b){ return b.likes - a.likes; });
    if (sorted.length === 0) { list.innerHTML = ''; return; }
    list.innerHTML = sorted.map(function(r) {
        var starsStr = '★'.repeat(r.avg) + '☆'.repeat(5 - r.avg);
        var delBtn = (currentId && r.authorId && r.authorId === currentId) ? '<button class="review-delete-btn" data-review-id="' + r.id + '" title="删除评价"><i class="fas fa-trash-alt"></i></button>' : '';
        var replies = getRepliesForReview(r.id);
        var replyCount = replies.length;
        return '<div class="review-item" data-likes="' + r.likes + '" data-time="' + r.time + '" data-id="' + r.id + '" style="position:relative;" data-review-id="' + r.id + '">' + delBtn + '<div class="review-item-content"><div class="review-stars">' + starsStr + '</div><p>"' + esc(r.text) + '"</p></div><div class="review-item-footer"><div class="review-item-author"><span>' + r.avatar + '</span><div><strong>' + esc(r.nickname) + '</strong><span>' + esc(r.identity) + '</span></div></div><div class="review-item-meta"><span>' + r.time + '</span><button class="like-btn" data-id="' + r.id + '"><i class="fas fa-heart"></i> <span>' + r.likes + '</span></button><button class="reply-toggle-btn" data-review-id="' + r.id + '"><i class="fas fa-reply"></i> (' + replyCount + ')</button></div></div><div class="reply-section" id="replySection-' + r.id + '" style="display:none;"></div></div>';
    }).join('');
    attachLikeHandlers();
    attachDeleteHandlers();
    attachReplyHandlers();
}

function renderAllReviews(sortType) {
    var reviews = getReviews();
    renderMainReviews(reviews);
    renderReviewsList(reviews, sortType || 'latest');
    fetch(WORKER_API + '/api/reviews').then(function(r){return r.json()}).then(function(remote) {
        if (remote && remote.length >= 0) {
            saveReviews(remote);
            renderMainReviews(remote);
            renderReviewsList(remote, sortType || 'latest');
        }
    }).catch(function(){});
}

function loadAllReplies() {
    // 简单策略：本地已有回复则用本地，否则等用户点回复时再加载
}

function getRepliesForReview(reviewId) {
    var all = getReplies();
    return all.filter(function(r) { return r.reviewId == reviewId; }).sort(function(a, b) { return a.id - b.id; });
}

function addReply(reviewId, replyData) {
    var all = getReplies();
    replyData.id = Date.now();
    replyData.reviewId = reviewId;
    all.push(replyData);
    saveReplies(all);
    workerSyncReplies(reviewId, replyData, 'add');
    return replyData;
}

function deleteReplyById(replyId) {
    var all = getReplies();
    all = all.filter(function(r) { return r.id != replyId; });
    saveReplies(all);
    fetch(WORKER_API + '/api/replies/' + replyId + '?authorId=' + encodeURIComponent(getCurrentUserId() || ''), { method: 'DELETE' }).catch(function(){});
}

function deleteReview(id) {
    if (!confirm('确定要删除这条评价吗？')) return;
    var reviews = getReviews();
    reviews = reviews.filter(function(r) { return r.id != id; });
    saveReviews(reviews);
    fetch(WORKER_API + '/api/reviews/' + id + '?authorId=' + encodeURIComponent(getCurrentUserId()), {method:'DELETE'}).catch(function(){});
    var allReplies = getReplies();
    allReplies = allReplies.filter(function(r) { return r.reviewId != id; });
    saveReplies(allReplies);
    var reviewsNow = getReviews();
    renderMainReviews(reviewsNow);
    renderReviewsList(reviewsNow, 'latest');
    showNotification('评价已删除', 'success');
}

function attachDeleteHandlers() {
    var currentId = getCurrentUserId();
    document.querySelectorAll('.review-delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var reviewId = parseInt(this.getAttribute('data-review-id'));
            deleteReview(reviewId);
        });
    });
}

function attachLikeHandlers() {
    var likedItems = JSON.parse(localStorage.getItem(LIKED_KEY) || '[]');
    document.querySelectorAll('.like-btn').forEach(function(btn) {
        var id = btn.getAttribute('data-id');
        if (likedItems.indexOf(id) !== -1) btn.classList.add('liked');
        btn.addEventListener('click', function() {
            var countEl = this.querySelector('span');
            var count = parseInt(countEl.textContent);
            if (likedItems.indexOf(id) !== -1) {
                showNotification('已经点过赞了~', 'error');
            } else {
                likedItems.push(id);
                countEl.textContent = count + 1;
                this.classList.add('liked');
                updateReviewLikes(id, 1);
            }
            localStorage.setItem(LIKED_KEY, JSON.stringify(likedItems));
        });
    });
}

function updateReviewLikes(id, delta) {
    var reviews = getReviews();
    for (var i = 0; i < reviews.length; i++) {
        if (reviews[i].id == id) { reviews[i].likes += delta; break; }
    }
    saveReviews(reviews);
    fetch(WORKER_API + '/api/reviews/' + id + '/like', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta: delta }) }).catch(function(){});
}

// ===== 回复交互 =====
// 主页"回复"按钮 → 打开评价弹窗
function attachMainReplyHandlers() {
    document.querySelectorAll('.reply-go-modal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var reviewsModal = document.getElementById('reviewsModal');
            if (reviewsModal) { reviewsModal.classList.add('active'); renderAllReviews(); }
        });
    });
}

// 弹窗内"回复"按钮 → 展开回复区
function attachReplyHandlers() {
    document.querySelectorAll('.reply-toggle-btn:not(.reply-go-modal)').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var reviewId = this.getAttribute('data-review-id');
            var section = document.getElementById('replySection-' + reviewId);
            if (section.style.display === 'none') {
                renderReplySection(reviewId, section);
                section.style.display = 'block';
                this.innerHTML = '<i class="fas fa-reply"></i> 收起';
            } else {
                section.style.display = 'none';
                var replies = getRepliesForReview(reviewId);
                this.innerHTML = '<i class="fas fa-reply"></i> 回复 (' + replies.length + ')';
            }
        });
    });
}

function renderReplySection(reviewId, container) {
    var renderReplies = function(remoteReplies) {
        var localReplies = getRepliesForReview(reviewId);
        var replies;
        if (localReplies && localReplies.length > 0) {
            replies = localReplies;
        } else if (remoteReplies && remoteReplies.length > 0) {
            replies = remoteReplies;
        } else {
            replies = [];
        }
        var currentId = getCurrentUserId();
        container.innerHTML = '<div class="reply-list">' +
            replies.map(function(rp) {
                var delBtn = (currentId && rp.authorId === currentId) ? '<button class="reply-delete-btn" data-reply-id="' + rp.id + '" data-review-id="' + reviewId + '"><i class="fas fa-times"></i></button>' : '';
                return '<div class="reply-item" style="position:relative;"><span class="reply-avatar">' + rp.avatar + '</span><div class="reply-body"><strong>' + esc(rp.nickname) + '</strong><span class="reply-time">' + rp.time + '</span><p>' + esc(rp.text) + '</p></div>' + delBtn + '</div>';
            }).join('') +
            '</div>' +
            '<form class="reply-form" data-review-id="' + reviewId + '" onsubmit="return submitReply(event, ' + reviewId + ')">' +
            '<textarea placeholder="写下你的回复..." rows="2" required></textarea>' +
            '<button type="submit" class="reply-submit-btn"><i class="fas fa-paper-plane"></i> 回复</button>' +
            '</form>';
        attachReplyDeleteButtons(container);
    };
    fetch(WORKER_API + '/api/reviews/' + reviewId + '/replies')
        .then(function(r) { return r.json(); })
        .then(renderReplies)
        .catch(function() { renderReplies(null); });
}

function attachReplyDeleteButtons(container) {
    container.querySelectorAll('.reply-delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var replyId = parseInt(this.getAttribute('data-reply-id'));
            var reviewId = this.getAttribute('data-review-id');
            if (!confirm('确定要删除这条回复吗？')) return;
            deleteReplyById(replyId);
            var section = document.getElementById('replySection-' + reviewId);
            renderReplySection(reviewId, section);
            showNotification('回复已删除', 'success');
        });
    });
}

function submitReply(e, reviewId) {
    e.preventDefault();
    var currentId = getCurrentUserId();
    if (!currentId) { showNotification('请先登录后再回复', 'error'); return false; }
    var form = e.target;
    var textarea = form.querySelector('textarea');
    var text = textarea.value.trim();
    if (!text) return false;
    addReply(reviewId, {
        nickname: localStorage.getItem('currentUserName') || '用户',
        avatar: localStorage.getItem('userAvatar') || '👤',
        text: text,
        time: new Date().toISOString().split('T')[0],
        authorId: currentId
    });
    var section = document.getElementById('replySection-' + reviewId);
    renderReplySection(reviewId, section);
    showNotification('回复成功！', 'success');
    return false;
}
window.submitReply = submitReply;

// 星级评价
document.querySelectorAll('.stars').forEach(function(stars) {
    stars.querySelectorAll('i').forEach(function(star) {
        star.addEventListener('click', function() {
            var i = parseInt(this.getAttribute('data-i'));
            stars.setAttribute('data-rating', i);
            stars.querySelectorAll('i').forEach(function(s, index) {
                s.className = index < i ? 'fas fa-star' : 'far fa-star';
            });
            // 检查评分并更新提示
            updateReviewPlaceholder();
        });
    });
});

function updateReviewPlaceholder() {
    var allRatings = [];
    document.querySelectorAll('.stars[data-rating]').forEach(function(s) {
        var r = parseInt(s.getAttribute('data-rating'));
        if (r > 0) allRatings.push(r);
    });
    if (allRatings.length < 3 && allRatings.length > 0) return;
    var hasLow = allRatings.some(function(r) { return r < 3; });
    var total = allRatings.reduce(function(a,b){return a+b}, 0);
    var all5 = allRatings.every(function(r) { return r === 5; });
    var textarea = document.querySelector('#reviewForm textarea') || document.getElementById('orderReviewText');
    if (!textarea) return;
    var msg = '分享您的拍摄体验...';
    if (allRatings.length === 0) msg = '分享您的拍摄体验...';
    else if (hasLow) msg = '求求你告诉我哪里没做好吧，下次一定改进！555.......';
    else if (total >= 10 && !all5) msg = '欢迎老师下次再会！悄悄告诉您，推荐给朋友或再次约单有专属优惠和返点喔！';
    else if (all5) msg = '非常感谢老师的认可！写下您的评价吧~';
    textarea.placeholder = msg;
}

// 提交评价（需登录）
function submitReview() {
    if (!getCurrentUserId()) {
        showNotification('请先登录后再发表评价', 'error');
        var loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.opacity = '1';
            loginModal.style.visibility = 'visible';
            loginModal.style.pointerEvents = 'auto';
        }
        return;
    }
    var ratings = [];
    document.querySelectorAll('.review-stars-input').forEach(function(stars) {
        ratings.push(parseInt(stars.getAttribute('data-rating')));
    });
    var text = document.querySelector('#reviewForm textarea').value;
    var nickname = document.querySelector('#reviewForm input').value;
    var identity = document.querySelector('#reviewForm select').value;

    if (!nickname || !identity) { showNotification('请填写昵称和身份', 'error'); return; }
    if (!text.trim()) { showNotification('请填写评价内容', 'error'); return; }

    var avg = ratings.length > 0 ? Math.round(ratings.reduce(function(a,b){return a+b},0) / ratings.length) : 5;
    var today = new Date().toISOString().split('T')[0];
    var avatars = { 'cosplay爱好者': '👩', '个人约拍客户': '🧑', '商业合作': '👨', '互勉创作': '🤝' };
    var avatar = avatars[identity] || '👤';

    var review = {
        id: Date.now(),
        nickname: nickname,
        identity: identity,
        avatar: avatar,
        text: text,
        ratings: ratings,
        avg: avg,
        likes: 0,
        time: today,
        authorId: getCurrentUserId()
    };

    var reviews = getReviews();
    reviews.push(review);
    saveReviews(reviews);
    fetch(WORKER_API + '/api/reviews', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(review)}).catch(function(){});
    renderMainReviews(reviews);
    renderReviewsList(reviews, 'latest');

    showNotification('评价发布成功！', 'success');
    document.getElementById('reviewForm').reset();
    document.querySelectorAll('.review-stars-input').forEach(function(s) { s.setAttribute('data-rating', '0'); s.querySelectorAll('i').forEach(function(i) { i.className = 'far fa-star'; }); });
    document.getElementById('reviewsModal').classList.remove('active');
}
window.submitReview = submitReview;

// 评价表单提交
var reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview();
    });
}

// ===== 评价弹窗 =====
var reviewsModal = document.getElementById('reviewsModal');
var reviewsMoreBtn = document.getElementById('reviewsMoreBtn');
var reviewsClose = document.getElementById('reviewsClose');
if (reviewsMoreBtn) reviewsMoreBtn.addEventListener('click', function() {
    if (!getCurrentUserId()) {
        showNotification('请先登录后再发表评价', 'error');
        var loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.opacity = '1';
            loginModal.style.visibility = 'visible';
            loginModal.style.pointerEvents = 'auto';
        }
        return;
    }
    if (reviewsModal) reviewsModal.classList.add('active');
});
if (reviewsClose) reviewsClose.addEventListener('click', function() { reviewsModal.classList.remove('active'); });
if (reviewsModal) reviewsModal.addEventListener('click', function(e) { if (e.target === reviewsModal) reviewsModal.classList.remove('active'); });

// 排序按钮
document.querySelectorAll('.sort-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sort-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        var sort = this.getAttribute('data-sort');
        renderAllReviews(sort);
    });
});

// 初始渲染评价
if (document.getElementById('reviewsMainGrid') || document.getElementById('reviewsList')) {
    renderAllReviews();
}
