// ===== 一方通行 管理后台 API Server =====
// 独立运行，端口 3001，不碰主站代码
var http = require('http');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var PORT = 3001;
var MAIN_DATA = '/var/www/api/data.json';
var ADMIN_DATA = '/var/www/api/admin.json';
var ANALYTICS_DATA = '/var/www/api/page_views.json';
var SUBMISSIONS_DATA = '/var/www/api/co_submissions.json';

// ===== 工具函数 =====
function hashPwd(pwd) {
    return crypto.createHash('sha256').update(pwd + 'admin_salt_yifang').digest('hex');
}

function loadJSON(filepath) {
    try { return JSON.parse(fs.readFileSync(filepath, 'utf8')); } catch(e) { return null; }
}

function saveJSON(filepath, data) {
    var dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function loadMain() {
    var data = loadJSON(MAIN_DATA);
    return data || { r: [], p: [], rescues: {}, wishes: [], users: {} };
}

function loadAdmin() {
    var data = loadJSON(ADMIN_DATA);
    return data || { admins: {} };
}

function loadAnalytics() {
    var data = loadJSON(ANALYTICS_DATA);
    return data || { views: [] };
}

function loadSubmissions() {
    var data = loadJSON(SUBMISSIONS_DATA);
    return data || { submissions: [] };
}

function ok(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' });
    res.end(JSON.stringify(data));
}

function err(res, msg, code) {
    res.writeHead(code || 400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: msg }));
}

function readBody(req, cb) {
    var body = '';
    req.on('data', function(c) { body += c; });
    req.on('end', function() { try { cb(JSON.parse(body)); } catch(e) { cb(null); } });
}

// ===== Token 管理 =====
var tokens = {}; // token -> { uid, expires }
var TOKEN_TTL = 30 * 60 * 1000; // 30分钟

function createToken(uid) {
    var token = crypto.randomBytes(32).toString('hex');
    tokens[token] = { uid: uid, expires: Date.now() + TOKEN_TTL };
    return token;
}

function verifyToken(token) {
    if (!token || !tokens[token]) return null;
    if (Date.now() > tokens[token].expires) { delete tokens[token]; return null; }
    tokens[token].expires = Date.now() + TOKEN_TTL; // 续期
    return tokens[token].uid;
}

// 清理过期token
setInterval(function() {
    var now = Date.now();
    Object.keys(tokens).forEach(function(t) { if (now > tokens[t].expires) delete tokens[t]; });
}, 60000);

// ===== 请求处理 =====
http.createServer(function(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' });
        return res.end();
    }

    var u = new URL(req.url, 'http://x');
    var p = u.pathname;

    try {
        // ===== 静态文件 =====
        if (req.method === 'GET' && (p === '/' || p === '/index.html')) {
            var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(html);
        }
        if (req.method === 'GET' && p === '/admin.css') {
            var css = fs.readFileSync(path.join(__dirname, 'admin.css'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
            return res.end(css);
        }
        if (req.method === 'GET' && p === '/admin.js') {
            var js = fs.readFileSync(path.join(__dirname, 'admin.js'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
            return res.end(js);
        }

        // ===== 访问追踪（公开接口，不需要认证）=====
        if (p === '/api/admin/track' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.path) return ok(res, { ok: true });
                var analytics = loadAnalytics();
                analytics.views.push({
                    path: body.path,
                    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                    ua: (req.headers['user-agent'] || '').substring(0, 100),
                    uid: body.uid || '',
                    time: Date.now()
                });
                // 保留最近 10000 条
                if (analytics.views.length > 10000) analytics.views = analytics.views.slice(-10000);
                saveJSON(ANALYTICS_DATA, analytics);
                ok(res, { ok: true });
            });
            return;
        }

        // ===== 初始设置（首次部署时创建管理员）=====
        if (p === '/api/admin/setup' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.account || !body.password) return err(res, '缺少账号或密码');
                var adminData = loadAdmin();
                if (Object.keys(adminData.admins).length > 0) return err(res, '管理员已存在，无法重复创建', 403);
                adminData.admins[body.account] = { name: body.name || body.account, password: hashPwd(body.password), created: Date.now() };
                saveJSON(ADMIN_DATA, adminData);
                ok(res, { success: true, message: '管理员创建成功' });
            });
            return;
        }

        // ===== 登录 =====
        if (p === '/api/admin/login' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.account || !body.password) return err(res, '缺少账号或密码');
                var adminData = loadAdmin();
                if (Object.keys(adminData.admins).length === 0) return err(res, '首次使用，请创建管理员账号', 404);
                var admin = adminData.admins[body.account];
                if (!admin || admin.password !== hashPwd(body.password)) return err(res, '账号或密码错误', 401);
                var token = createToken(body.account);
                ok(res, { token: token, name: admin.name || body.account });
            });
            return;
        }

        // ===== 验证token =====
        if (p === '/api/admin/verify' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.token) return err(res, '缺少token', 401);
                var uid = verifyToken(body.token);
                if (!uid) return err(res, 'token无效或已过期', 401);
                ok(res, { valid: true, uid: uid });
            });
            return;
        }

        // ===== 以下接口需要认证 =====
        var authHeader = req.headers['authorization'] || '';
        var token = authHeader.replace('Bearer ', '');
        var adminUid = verifyToken(token);
        if (!adminUid) return err(res, '请先登录', 401);

        // ===== 仪表盘统计 =====
        if (p === '/api/admin/stats' && req.method === 'GET') {
            var main = loadMain();
            var analytics = loadAnalytics();
            var now = new Date();
            var today = now.toISOString().split('T')[0];
            var todayViews = analytics.views.filter(function(v) {
                return new Date(v.time).toISOString().split('T')[0] === today;
            });
            var uniqueToday = new Set(todayViews.map(function(v) { return v.ip + (v.uid || ''); })).size;
            var totalUsers = main.users ? Object.keys(main.users).length : 0;
            // 近7天趋势
            var trend = [];
            for (var i = 6; i >= 0; i--) {
                var d = new Date(now.getTime() - i * 86400000).toISOString().split('T')[0];
                var dayViews = analytics.views.filter(function(v) { return new Date(v.time).toISOString().split('T')[0] === d; });
                trend.push({ date: d, count: dayViews.length });
            }
            // 热门页面
            var pathCounts = {};
            analytics.views.forEach(function(v) { pathCounts[v.path] = (pathCounts[v.path] || 0) + 1; });
            var hotPages = Object.keys(pathCounts).map(function(k) { return { path: k, count: pathCounts[k] }; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 5);
            ok(res, {
                totalViews: analytics.views.length,
                todayViews: todayViews.length,
                uniqueToday: uniqueToday,
                totalUsers: totalUsers,
                totalReviews: (main.r || []).length,
                totalReplies: (main.p || []).length,
                totalRescues: main.rescues ? Object.keys(main.rescues).length : 0,
                totalWishes: (main.wishes || []).length,
                trend: trend,
                hotPages: hotPages
            });
            return;
        }

        // ===== 页面访问记录 =====
        if (p === '/api/admin/pageviews' && req.method === 'GET') {
            var analytics = loadAnalytics();
            var limit = parseInt(u.searchParams.get('limit')) || 100;
            var views = analytics.views.slice(-limit).reverse();
            ok(res, { views: views });
            return;
        }

        // ===== 用户管理 =====
        if (p === '/api/admin/users' && req.method === 'GET') {
            var main = loadMain();
            var users = main.users || {};
            var list = Object.keys(users).map(function(k) {
                return { account: k, name: users[k].name, phone: users[k].phone || '', banned: users[k].banned || false };
            });
            ok(res, { users: list });
            return;
        }

        if (p === '/api/admin/users/ban' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.account) return err(res, '缺少账号');
                var main = loadMain();
                if (!main.users || !main.users[body.account]) return err(res, '用户不存在', 404);
                main.users[body.account].banned = !main.users[body.account].banned;
                saveJSON(MAIN_DATA, main);
                ok(res, { success: true, banned: main.users[body.account].banned });
            });
            return;
        }

        // ===== 评论管理 =====
        if (p === '/api/admin/reviews' && req.method === 'GET') {
            var main = loadMain();
            var reviews = (main.r || []).map(function(r) {
                r.replyCount = (main.p || []).filter(function(x) { return x.reviewId == r.id; }).length;
                return r;
            });
            ok(res, { reviews: reviews });
            return;
        }

        if (p.match(/^\/api\/admin\/reviews\/\d+$/) && req.method === 'DELETE') {
            var rid = parseInt(p.split('/')[4]);
            var main = loadMain();
            main.r = (main.r || []).filter(function(x) { return x.id != rid; });
            main.p = (main.p || []).filter(function(x) { return x.reviewId != rid; });
            saveJSON(MAIN_DATA, main);
            ok(res, { success: true });
            return;
        }

        // ===== 回复管理 =====
        if (p === '/api/admin/replies' && req.method === 'GET') {
            var main = loadMain();
            ok(res, { replies: main.p || [] });
            return;
        }

        if (p.match(/^\/api\/admin\/replies\/\d+$/) && req.method === 'DELETE') {
            var rpid = parseInt(p.split('/')[4]);
            var main = loadMain();
            main.p = (main.p || []).filter(function(x) { return x.id != rpid; });
            saveJSON(MAIN_DATA, main);
            ok(res, { success: true });
            return;
        }

        // ===== 救援管理 =====
        if (p === '/api/admin/rescues' && req.method === 'GET') {
            var main = loadMain();
            var allRescues = [];
            Object.keys(main.rescues || {}).forEach(function(uid) {
                (main.rescues[uid] || []).forEach(function(r) { r._uid = uid; allRescues.push(r); });
            });
            ok(res, { rescues: allRescues });
            return;
        }

        if (p.match(/^\/api\/admin\/rescues\/\d+\/fix$/) && req.method === 'POST') {
            var resid = parseInt(p.split('/')[4]);
            var main = loadMain();
            Object.keys(main.rescues || {}).forEach(function(uid) {
                main.rescues[uid] = (main.rescues[uid] || []).map(function(r) {
                    if (r.id == resid) r.fixed = true;
                    return r;
                });
            });
            saveJSON(MAIN_DATA, main);
            ok(res, { success: true });
            return;
        }

        // ===== 许愿池管理 =====
        if (p === '/api/admin/wishes' && req.method === 'GET') {
            var main = loadMain();
            ok(res, { wishes: (main.wishes || []).sort(function(a, b) { return b.votes - a.votes; }) });
            return;
        }

        if (p.match(/^\/api\/admin\/wishes\/\d+$/) && req.method === 'DELETE') {
            var wid = parseInt(p.split('/')[4]);
            var main = loadMain();
            main.wishes = (main.wishes || []).filter(function(x) { return x.id != wid; });
            saveJSON(MAIN_DATA, main);
            ok(res, { success: true });
            return;
        }

        // ===== 共创投稿 =====
        if (p === '/api/admin/submissions' && req.method === 'GET') {
            var subs = loadSubmissions();
            ok(res, { submissions: subs.submissions || [] });
            return;
        }

        if (p === '/api/admin/submissions' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body) return err(res, '数据错误');
                var subs = loadSubmissions();
                body.id = Date.now();
                body.time = new Date().toISOString();
                subs.submissions = subs.submissions || [];
                subs.submissions.push(body);
                saveJSON(SUBMISSIONS_DATA, subs);
                ok(res, { success: true, id: body.id });
            });
            return;
        }

        if (p.match(/^\/api\/admin\/submissions\/\d+$/) && req.method === 'DELETE') {
            var subId = parseInt(p.split('/')[4]);
            var subs = loadSubmissions();
            subs.submissions = (subs.submissions || []).filter(function(x) { return x.id != subId; });
            saveJSON(SUBMISSIONS_DATA, subs);
            ok(res, { success: true });
            return;
        }

        // ===== 作品集管理 =====
        if (p === '/api/admin/portfolio' && req.method === 'GET') {
            var portfolioDir = '/var/www/images';
            var categories = ['portrait', 'creative', 'event', 'scene'];
            var result = {};
            categories.forEach(function(cat) {
                var catDir = path.join(portfolioDir, cat);
                try {
                    result[cat] = fs.readdirSync(catDir).filter(function(f) { return /\.(jpg|jpeg|png|gif|webp)$/i.test(f); });
                } catch(e) { result[cat] = []; }
            });
            // 主图
            try {
                result['main'] = fs.readdirSync(portfolioDir).filter(function(f) { return /\.(jpg|jpeg|png|gif|webp)$/i.test(f); });
            } catch(e) { result['main'] = []; }
            ok(res, { portfolio: result });
            return;
        }

        if (p === '/api/admin/portfolio/upload' && req.method === 'POST') {
            var body = '';
            req.on('data', function(c) { body += c; });
            req.on('end', function() {
                try {
                    var data = JSON.parse(body);
                    if (!data.category || !data.filename || !data.data) return err(res, '缺少参数');
                    var cat = data.category.replace(/[^a-zA-Z0-9_-]/g, '');
                    var filename = data.filename.replace(/[^a-zA-Z0-9_.-]/g, '');
                    var dir = '/var/www/images/' + cat;
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    var base64 = data.data.replace(/^data:image\/\w+;base64,/, '');
                    fs.writeFileSync(path.join(dir, filename), Buffer.from(base64, 'base64'));
                    ok(res, { success: true, path: '/images/' + cat + '/' + filename });
                } catch(e) { err(res, '上传失败: ' + e.message); }
            });
            return;
        }

        if (p === '/api/admin/portfolio/delete' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.category || !body.filename) return err(res, '缺少参数');
                var cat = body.category.replace(/[^a-zA-Z0-9_-]/g, '');
                var filename = body.filename.replace(/[^a-zA-Z0-9_.-]/g, '');
                var filepath = '/var/www/images/' + cat + '/' + filename;
                try { fs.unlinkSync(filepath); ok(res, { success: true }); } catch(e) { err(res, '删除失败', 404); }
            });
            return;
        }

        // ===== 订单管理 =====
        if (p === '/api/admin/orders' && req.method === 'GET') {
            var main = loadMain();
            ok(res, { orders: main.orders || [] });
            return;
        }

        if (p.match(/^\/api\/admin\/orders\/\d+\/status$/) && req.method === 'PATCH') {
            var orderId = parseInt(p.split('/')[4]);
            readBody(req, function(body) {
                if (!body || !body.status) return err(res, '缺少状态');
                var main = loadMain();
                if (!main.orders) main.orders = [];
                var order = main.orders.filter(function(o) { return o.id == orderId; })[0];
                if (!order) return err(res, '订单不存在', 404);
                order.status = body.status;
                saveJSON(MAIN_DATA, main);
                ok(res, { success: true });
            });
            return;
        }

        // ===== 404 =====
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));

    } catch(e) {
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
    }
}).listen(PORT, function() {
    console.log('管理后台 API Server OK port ' + PORT);
});
