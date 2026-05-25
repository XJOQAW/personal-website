// ===== 一方通行 核心共享模块 =====
var WORKER_API = 'http://8.137.188.207:3000';
// 后续如需HTTPS: 配置nginx反向代理后改为 https://yifangtx.xyz

function esc(s) {
    var d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

function getCurrentUserId() {
    var localUser = localStorage.getItem('currentUser');
    if (localUser) return localUser;
    if (typeof firebase !== 'undefined' && firebase.apps.length && firebase.auth().currentUser) {
        return firebase.auth().currentUser.email || firebase.auth().currentUser.uid;
    }
    return null;
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
