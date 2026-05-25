module.exports = {
    apps: [{
        name: 'yifang-api',
        script: 'server.js',
        cwd: '/var/www/',
        max_memory_restart: '200M',
        restart_delay: 3000,
        max_restarts: 10,
        env: { NODE_ENV: 'production' }
    }]
};
