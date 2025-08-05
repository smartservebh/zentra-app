module.exports = {
  apps: [{
    name: 'zentra',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'generated-apps', '.git'],
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000,
    wait_ready: true,
    autorestart: true,
    vizion: true,
    post_update: ['npm install'],
    
    // Environment specific configurations
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      instances: 'max',
      exec_mode: 'cluster',
      error_file: '/var/log/zentra/error.log',
      out_file: '/var/log/zentra/out.log',
      log_file: '/var/log/zentra/combined.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Advanced configurations
      instance_var: 'INSTANCE_ID',
      
      // Monitoring
      pmx: true,
      
      // Graceful shutdown
      shutdown_with_message: true,
      
      // Health check
      health_check: {
        interval: 30,
        url: 'http://localhost:3000/api/health',
        max_consecutive_failures: 3
      }
    }
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'zentrahub.pro',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/zentra-app.git',
      path: '/home/ubuntu/zentra',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no'
    }
  }
};