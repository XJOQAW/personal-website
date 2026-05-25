const { execSync } = require('child_process');
try {
    var pass = process.env.SSH_PASS || '';
    var host = process.env.SSH_HOST || '';
    if (!pass || !host) { console.log('请先设置环境变量 SSH_PASS 和 SSH_HOST'); process.exit(1); }
    const cmd = 'echo ' + pass + ' | ssh -tt -o StrictHostKeyChecking=no -o PasswordAuthentication=yes -o PreferredAuthentications=password root@' + host + ' "curl http://127.0.0.1:3000/api/reviews"';
    console.log(execSync(cmd, { encoding: 'utf8', timeout: 15000 }));
} catch(e) {
    console.log('FAIL:', e.stderr || e.stdout || e.message);
}
