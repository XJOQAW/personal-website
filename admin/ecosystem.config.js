module.exports = {
    apps: [{
        name: 'yifang-admin',
        script: 'server.js',
        cwd: '/var/www/admin',
        max_memory_restart: '100M',
        restart_delay: 3000,
        max_restarts: 10,
        env: { NODE_ENV: 'production' }
    }]
};
