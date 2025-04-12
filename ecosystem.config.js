module.exports = {
  apps: [{
    name: "jobefinder",
    script: "build/index.js", // Path to your built application
    instances: "max", // Use maximum number of CPU cores
    exec_mode: "cluster", // Run in cluster mode
    autorestart: true, // Auto restart if app crashes
    watch: false, // Don't watch for file changes
    max_memory_restart: "1G", // Restart if memory exceeds 1GB
    env: {
      NODE_ENV: "production",
      PORT: 3000 // Your application port
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    },
    // Additional options
    error_file: "logs/err.log", // Error log file path
    out_file: "logs/out.log", // Output log file path
    time: true, // Add timestamps to logs
    ignore_watch: ["node_modules", "logs"], // Folders to ignore when watching
    max_restarts: 10, // Maximum number of restarts on error
    restart_delay: 4000, // Delay between automatic restarts
    exp_backoff_restart_delay: 100, // Exponential backoff for automatic restarts
    merge_logs: true, // Merge logs from all instances
    log_date_format: "YYYY-MM-DD HH:mm:ss Z" // Log date format
  }]
}; 