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
