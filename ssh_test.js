const { execSync } = require('child_process');
try {
    const cmd = 'echo Ysh443320 | ssh -tt -o StrictHostKeyChecking=no -o PasswordAuthentication=yes -o PreferredAuthentications=password root@8.137.188.207 "curl http://127.0.0.1:3000/api/reviews"';
    console.log(execSync(cmd, { encoding: 'utf8', timeout: 15000 }));
} catch(e) {
    console.log('FAIL:', e.stderr || e.stdout || e.message);
}
