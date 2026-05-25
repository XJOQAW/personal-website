// ===== 一方通行 API Server =====
// 部署到自有服务器，替代 Cloudflare Worker
var http = require('http');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var PORT = 3000;
var DATA = '/var/www/api/data.json';

function hashPwd(pwd) {
    return crypto.createHash('sha256').update(pwd + 'yifang_salt').digest('hex');
}

function load() {
    try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch(e) {
        return { r: [], p: [], rescues: {}, wishes: [] };
    }
}

function save(db) {
    var dir = path.dirname(DATA);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA, JSON.stringify(db));
}

function ok(res, data) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

function err(res, msg, code) {
    res.writeHead(code || 400, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: msg }));
}

function readBody(req, cb) {
    var body = '';
    req.on('data', function(c) { body += c; });
    req.on('end', function() {
        try { cb(JSON.parse(body)); } catch(e) { cb(null); }
    });
}

http.createServer(function(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        return res.end();
    }

    var u = new URL(req.url, 'http://x');
    var p = u.pathname;

    try {
        // ===== 评论 =====
        if (p === '/api/reviews' && req.method === 'GET') {
            var db = load();
            var reviews = db.r.map(function(r) {
                r.replyCount = db.p.filter(function(x) { return x.reviewId == r.id; }).length;
                return r;
            });
            return ok(res, reviews);
        }

        if (p === '/api/reviews' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body) return err(res, '请求数据错误');
                var db = load();
                body.id = Date.now();
                body.likes = body.likes || 0;
                db.r.push(body);
                save(db);
                body.replyCount = 0;
                ok(res, body);
            });
            return;
        }

        if (p.startsWith('/api/reviews/') && req.method === 'DELETE') {
            var rid = parseInt(p.split('/')[3]);
            var aid = u.searchParams.get('authorId');
            var db = load();
            var review = db.r.filter(function(x) { return x.id == rid; })[0];
            if (!review) return err(res, '评论不存在', 404);
            if (aid && review.authorId !== aid) return err(res, '无权限', 403);
            db.r = db.r.filter(function(x) { return x.id != rid; });
            db.p = db.p.filter(function(x) { return x.reviewId != rid; });
            save(db);
            ok(res, { success: true });
            return;
        }

        if (p.startsWith('/api/reviews/') && p.endsWith('/like') && req.method === 'PATCH') {
            var lrid = parseInt(p.split('/')[3]);
            readBody(req, function(body) {
                if (!body) return err(res, '请求数据错误');
                var db = load();
                for (var i = 0; i < db.r.length; i++) {
                    if (db.r[i].id == lrid) {
                        db.r[i].likes = Math.max(0, (db.r[i].likes || 0) + (body.delta || 0));
                        break;
                    }
                }
                save(db);
                ok(res, { likes: db.r.filter(function(x) { return x.id == lrid; })[0].likes });
            });
            return;
        }

        // ===== 回复 =====
        if (p.match(/^\/api\/reviews\/\d+\/replies$/) && req.method === 'GET') {
            var revId = parseInt(p.split('/')[3]);
            var db = load();
            ok(res, db.p.filter(function(x) { return x.reviewId == revId; }).sort(function(a, b) { return a.id - b.id; }));
            return;
        }

        if (p.match(/^\/api\/reviews\/\d+\/replies$/) && req.method === 'POST') {
            var prId = parseInt(p.split('/')[3]);
            readBody(req, function(body) {
                if (!body) return err(res, '请求数据错误');
                var db = load();
                body.id = Date.now();
                body.reviewId = prId;
                db.p.push(body);
                save(db);
                ok(res, body);
            });
            return;
        }

        if (p.startsWith('/api/replies/') && req.method === 'DELETE') {
            var rpid = parseInt(p.split('/')[3]);
            var paid = u.searchParams.get('authorId');
            var db = load();
            var reply = db.p.filter(function(x) { return x.id == rpid; })[0];
            if (!reply) return err(res, '回复不存在', 404);
            if (paid && reply.authorId !== paid) return err(res, '无权限', 403);
            db.p = db.p.filter(function(x) { return x.id != rpid; });
            save(db);
            ok(res, { success: true });
            return;
        }

        // ===== 救援/投稿 =====
        if (p === '/api/rescues/sync' && req.method === 'GET') {
            var uid = u.searchParams.get('userId');
            if (!uid) return err(res, '缺少userId');
            var db = load();
            ok(res, { rescues: db.rescues[uid] || [] });
            return;
        }

        if (p === '/api/rescues/sync' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.userId) return err(res, '缺少必填');
                var db = load();
                db.rescues[body.userId] = body.rescues || [];
                save(db);
                ok(res, { success: true });
            });
            return;
        }

        // ===== 许愿池 =====
        if (p === '/api/wishes' && req.method === 'GET') {
            var db = load();
            ok(res, (db.wishes || []).sort(function(a, b) { return (b.votes || 0) - (a.votes || 0); }));
            return;
        }

        if (p === '/api/wishes' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.name || !body.authorId) return err(res, '缺少必填');
                var db = load();
                body.id = Date.now();
                body.votes = body.votes || 0;
                if (!db.wishes) db.wishes = [];
                db.wishes.push(body);
                save(db);
                ok(res, body);
            });
            return;
        }

        if (p.startsWith('/api/wishes/') && req.method === 'DELETE') {
            var wid = parseInt(p.split('/')[3]);
            var waid = u.searchParams.get('authorId');
            var db = load();
            var w = (db.wishes || []).filter(function(x) { return x.id == wid; })[0];
            if (!w) return err(res, '不存在', 404);
            if (waid && w.authorId !== waid) return err(res, '无权限', 403);
            db.wishes = db.wishes.filter(function(x) { return x.id != wid; });
            save(db);
            ok(res, { success: true });
            return;
        }

        if (p.startsWith('/api/wishes/') && p.endsWith('/vote') && req.method === 'PATCH') {
            var vwid = parseInt(p.split('/')[3]);
            readBody(req, function(body) {
                if (!body) return err(res, '请求数据错误');
                var db = load();
                var wv = (db.wishes || []).filter(function(x) { return x.id == vwid; })[0];
                if (!wv) return err(res, '不存在', 404);
                wv.votes = Math.max(0, (wv.votes || 0) + (body.delta || 1));
                save(db);
                ok(res, { success: true });
            });
            return;
        }

        // ===== 账号系统 =====
        if (p === '/api/auth/register' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.name || !body.account || !body.password) return err(res, '缺少必填');
                var db = load();
                if (!db.users) db.users = {};
                if (db.users[body.account]) return err(res, '该账号已被注册');
                db.users[body.account] = { name: body.name, password: hashPwd(body.password) };
                save(db);
                ok(res, { account: body.account, name: body.name });
            });
            return;
        }

        if (p === '/api/auth/login' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.account || !body.password) return err(res, '缺少账号或密码');
                var db = load();
                var u = (db.users || {})[body.account];
                if (!u) return err(res, '账号不存在');
                if (u.password !== hashPwd(body.password)) return err(res, '密码错误');
                ok(res, { account: body.account, name: u.name });
            });
            return;
        }

        if (p === '/api/auth/changepwd' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.account || !body.oldPassword || !body.newPassword) return err(res, '缺少必填');
                var db = load();
                var u = (db.users || {})[body.account];
                if (!u) return err(res, '账号不存在');
                if (u.password !== hashPwd(body.oldPassword)) return err(res, '原密码错误');
                if (body.newPassword.length < 6) return err(res, '新密码至少6位');
                u.password = hashPwd(body.newPassword);
                save(db);
                ok(res, { success: true });
            });
            return;
        }

        if (p === '/api/auth/avatar' && req.method === 'GET') {
            var avAcc = u.searchParams.get('account');
            var avPath = '/var/www/images/avatars/' + (avAcc || 'default') + '.png';
            try {
                var buf = fs.readFileSync(avPath);
                res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'max-age=3600' });
                res.end(buf);
            } catch(e) {
                res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
                res.end();
            }
            return;
        }

        if (p === '/api/auth/avatar' && req.method === 'POST') {
            readBody(req, function(body) {
                if (!body || !body.account || !body.data) return err(res, '缺少必填');
                var d = path.dirname('/var/www/images/avatars/');
                if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
                var base64 = body.data.replace(/^data:image\/\w+;base64,/, '');
                fs.writeFileSync('/var/www/images/avatars/' + body.account + '.png', Buffer.from(base64, 'base64'));
                ok(res, { success: true });
            });
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));

    } catch(e) {
        console.error(e);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
    }
}).listen(PORT, function() {
    console.log('一方通行 API Server OK port ' + PORT);
});
