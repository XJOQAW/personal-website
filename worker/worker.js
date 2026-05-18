// ===== 一方通行 评论系统 Worker =====
// 部署到 Cloudflare Workers + D1

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers, status: 204 });
    }

    try {
      // ===== 评论 =====
      if (path === '/api/reviews' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT r.*, (SELECT COUNT(*) FROM replies WHERE reviewId = r.id) AS replyCount FROM reviews r ORDER BY r.id DESC'
        ).all();
        return new Response(JSON.stringify(results), { headers });
      }

      if (path === '/api/reviews' && method === 'POST') {
        const body = await request.json();
        const { nickname, identity, avatar, text, ratings, avg, time, authorId } = body;
        if (!nickname || !text || !authorId) {
          return new Response(JSON.stringify({ error: '缺少必填字段' }), { status: 400, headers });
        }
        const result = await env.DB.prepare(
          'INSERT INTO reviews (nickname, identity, avatar, text, ratings, avg, likes, time, authorId) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)'
        ).bind(nickname, identity || '', avatar || '👤', text, JSON.stringify(ratings || []), avg || 5, time, authorId).run();
        const review = await env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(result.meta.last_row_id).first();
        review.replyCount = 0;
        review.ratings = JSON.parse(review.ratings);
        return new Response(JSON.stringify(review), { headers, status: 201 });
      }

      // 删除评论
      if (path.startsWith('/api/reviews/') && method === 'DELETE') {
        const id = path.split('/')[3];
        const authorId = url.searchParams.get('authorId');
        const review = await env.DB.prepare('SELECT authorId FROM reviews WHERE id = ?').bind(id).first();
        if (!review) return new Response(JSON.stringify({ error: '评论不存在' }), { status: 404, headers });
        if (review.authorId !== authorId) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers });
        await env.DB.prepare('DELETE FROM replies WHERE reviewId = ?').bind(id).run();
        await env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      // 点赞/取消点赞
      if (path.startsWith('/api/reviews/') && path.endsWith('/like') && method === 'PATCH') {
        const id = path.split('/')[3];
        const body = await request.json();
        const delta = body.delta || 0;
        await env.DB.prepare('UPDATE reviews SET likes = MAX(0, likes + ?) WHERE id = ?').bind(delta, id).run();
        const updated = await env.DB.prepare('SELECT likes FROM reviews WHERE id = ?').bind(id).first();
        return new Response(JSON.stringify({ likes: updated ? updated.likes : 0 }), { headers });
      }

      // ===== 回复 =====
      if (path.match(/^\/api\/reviews\/\d+\/replies$/) && method === 'GET') {
        const reviewId = path.split('/')[3];
        const { results } = await env.DB.prepare(
          'SELECT * FROM replies WHERE reviewId = ? ORDER BY id ASC'
        ).bind(reviewId).all();
        return new Response(JSON.stringify(results), { headers });
      }

      if (path.match(/^\/api\/reviews\/\d+\/replies$/) && method === 'POST') {
        const reviewId = path.split('/')[3];
        const body = await request.json();
        const { nickname, avatar, text, time, authorId } = body;
        if (!nickname || !text || !authorId) {
          return new Response(JSON.stringify({ error: '缺少必填字段' }), { status: 400, headers });
        }
        const result = await env.DB.prepare(
          'INSERT INTO replies (reviewId, nickname, avatar, text, time, authorId) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(reviewId, nickname, avatar || '👤', text, time, authorId).run();
        const reply = await env.DB.prepare('SELECT * FROM replies WHERE id = ?').bind(result.meta.last_row_id).first();
        return new Response(JSON.stringify(reply), { headers, status: 201 });
      }

      // 删除回复
      if (path.startsWith('/api/replies/') && method === 'DELETE') {
        const id = path.split('/')[3];
        const authorId = url.searchParams.get('authorId');
        const reply = await env.DB.prepare('SELECT authorId FROM replies WHERE id = ?').bind(id).first();
        if (!reply) return new Response(JSON.stringify({ error: '回复不存在' }), { status: 404, headers });
        if (reply.authorId !== authorId) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers });
        await env.DB.prepare('DELETE FROM replies WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      // ===== 许愿池 =====
      if (path === '/api/wishes' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM wishes ORDER BY votes DESC').all();
        return new Response(JSON.stringify(results), { headers });
      }
      if (path === '/api/wishes' && method === 'POST') {
        const body = await request.json();
        const { name, time, votes, authorId } = body;
        if (!name || !authorId) return new Response(JSON.stringify({ error: '缺少必填' }), { status: 400, headers });
        const result = await env.DB.prepare('INSERT INTO wishes (name, time, votes, authorId) VALUES (?,?,?,?)').bind(name, time, votes||0, authorId).run();
        const wish = await env.DB.prepare('SELECT * FROM wishes WHERE id = ?').bind(result.meta.last_row_id).first();
        return new Response(JSON.stringify(wish), { headers, status: 201 });
      }
      if (path.startsWith('/api/wishes/') && method === 'DELETE') {
        const id = path.split('/')[3];
        const authorId = url.searchParams.get('authorId');
        const w = await env.DB.prepare('SELECT authorId FROM wishes WHERE id = ?').bind(id).first();
        if (!w) return new Response(JSON.stringify({ error: '不存在' }), { status: 404, headers });
        if (w.authorId !== authorId) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers });
        await env.DB.prepare('DELETE FROM wishes WHERE id = ?').bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }
      if (path.startsWith('/api/wishes/') && path.endsWith('/vote') && method === 'PATCH') {
        const id = path.split('/')[3];
        const body = await request.json();
        await env.DB.prepare('UPDATE wishes SET votes = MAX(0, votes + ?) WHERE id = ?').bind(body.delta||1, id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};
