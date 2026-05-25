// ===== 一方通行 登录/注册模块 =====
async function hashPassword(pwd) {
    var encoder = new TextEncoder();
    var data = encoder.encode(pwd + 'yifang_salt_2026');
    var hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(function(b) { return ('0' + b.toString(16)).slice(-2); }).join('');
}

function doLogin(e) {
    e.preventDefault();
    var acc = document.getElementById('loginAccount').value.trim();
    var pwd = document.getElementById('loginPassword').value;
    if (!acc || !pwd) { showNotification('请输入账号和密码', 'error'); return; }

    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(function() {
                return firebase.auth().signInWithEmailAndPassword(acc + '@yifang.user', pwd);
            })
            .then(function() {
                localStorage.setItem('currentUser', acc);
                localStorage.setItem('currentUserName', acc);
                var m = document.getElementById('loginModal');
                m.style.opacity = '0'; m.style.visibility = 'hidden'; m.style.pointerEvents = 'none';
                showNotification('登录成功！', 'success');setTimeout(function(){location.reload()},300)
            })
            .catch(function(err) {
                if (err.code === 'auth/network-request-failed') {
                    loginLocal(acc, pwd);
                } else {
                    var msg = err.code === 'auth/user-not-found' ? '账号不存在' : err.code === 'auth/wrong-password' ? '密码错误' : err.message;
                    showNotification(msg, 'error');
                }
            });
    } else {
        loginLocal(acc, pwd);
    }
}

function loginLocal(acc, pwd) {
    hashPassword(pwd).then(function(hashed) {
        var users = JSON.parse(localStorage.getItem('localUsers') || '{}');
        if (!users[acc]) { showNotification('账号不存在，请先注册', 'error'); return; }
        if (users[acc].password !== hashed) { showNotification('密码错误', 'error'); return; }
        localStorage.setItem('currentUser', acc);
        localStorage.setItem('currentUserName', users[acc].name);
        var m = document.getElementById('loginModal');
        m.style.opacity = '0'; m.style.visibility = 'hidden'; m.style.pointerEvents = 'none';
        updateLocalAuthUI();
        showNotification('登录成功！（本地模式）', 'success');setTimeout(function(){location.reload()},300)
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

    var users = JSON.parse(localStorage.getItem('localUsers') || '{}');
    if (users[acc]) { showNotification('该账号已被注册', 'error'); return; }

    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        firebase.auth().createUserWithEmailAndPassword(acc + '@yifang.user', pwd)
            .then(function(result) { return result.user.updateProfile({ displayName: name }); })
            .then(function() {
                localStorage.setItem('currentUser', acc);
                localStorage.setItem('currentUserName', name);
                var m = document.getElementById('loginModal');
                m.style.opacity = '0'; m.style.visibility = 'hidden'; m.style.pointerEvents = 'none';
                showNotification('注册成功！', 'success');setTimeout(function(){location.reload()},300)
            })
            .catch(function(err) {
                if (err.code === 'auth/network-request-failed') {
                    registerLocal(name, acc, pwd);
                } else {
                    showNotification(err.code === 'auth/email-already-in-use' ? '该账号已被注册' : err.message, 'error');
                }
            });
    } else {
        registerLocal(name, acc, pwd);
    }
}

function registerLocal(name, acc, pwd) {
    hashPassword(pwd).then(function(hashed) {
        var users = JSON.parse(localStorage.getItem('localUsers') || '{}');
        users[acc] = { name: name, password: hashed };
        localStorage.setItem('localUsers', JSON.stringify(users));
        localStorage.setItem('currentUser', acc);
        localStorage.setItem('currentUserName', name);
        var m = document.getElementById('loginModal');
        m.style.opacity = '0'; m.style.visibility = 'hidden'; m.style.pointerEvents = 'none';
        updateLocalAuthUI();
        showNotification('注册成功！（本地模式）', 'success');setTimeout(function(){location.reload()},300)
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
