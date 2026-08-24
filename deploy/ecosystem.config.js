// PM2 process definition — keeps the API alive 24/7, restarts on crash/boots.
//
// Start:   pm2 start deploy/ecosystem.config.js
// Verify:  pm2 status && pm2 logs greggory-api
// Persist: pm2 save  &&  pm2 startup   (follow the printed command once)
module.exports = {
  apps: [
    {
      name: "greggory-api",
      script: "server.js",
      cwd: "/opt/greggory-app",          // repo cloned directly into this folder
      instances: 1,                       // keep 1 — in-memory session/rate-limit state
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
      },
      out_file: "/var/log/greggory/out.log",
      error_file: "/var/log/greggory/err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
