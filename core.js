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
