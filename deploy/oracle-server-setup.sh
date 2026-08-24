#!/usr/bin/env bash
# ============================================================
# ONE-TIME SERVER PROVISIONING — Oracle Always Free VM (Ubuntu 22.04/24.04)
# Run as:  sudo bash deploy/oracle-server-setup.sh
# Installs: Node 20, MySQL Server, PM2, Nginx, Certbot, Git
# ============================================================
set -euo pipefail

echo "==> [1/8] System update"
apt update && apt upgrade -y

echo "==> [2/8] Node.js 20 LTS (arm64-safe via NodeSource)"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v

echo "==> [3/8] MySQL Server"
export DEBIAN_FRONTEND=noninteractive
apt install -y mysql-server
systemctl enable --now mysql

# Lock down root auth method + create app DB/user (prompts for a password)
read -rp "Set a strong MySQL password for user 'greggory_app': " DBPASS
mysql <<SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '${DBPASS}';
CREATE DATABASE IF NOT EXISTS the_greggory_systems_and_strategy_firm_db_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'greggory_app'@'localhost' IDENTIFIED BY '${DBPASS}';
GRANT ALL PRIVILEGES ON the_greggory_systems_and_strategy_firm_db_main.* TO 'greggory_app'@'localhost';
FLUSH PRIVILEGES;
SQL
echo "MySQL ready. (root and greggory_app share the password you entered)"

echo "==> [4/8] PM2 + Nginx + Certbot + Git"
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx git

echo "==> [5/8] Firewall (OS layer)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
# NOTE: Oracle images also ship locked iptables rules; the lines below keep
# them open. Cloud-side, you MUST still add ingress rules in the instance's
# Security List (Console -> Instance -> Subnet -> Security List): TCP 80+443 from 0.0.0.0/0.
iptables -I INPUT -p tcp --dport 80 -j ACCEPT
iptables -I INPUT -p tcp --dport 443 -j ACCEPT
netfilter-persistent save 2>/dev/null || true

echo "==> [6/8] App directory"
mkdir -p /opt/greggory-app
cd /opt/greggory-app
if [ ! -d .git ]; then
  read -rp "Paste your GitHub repo URL: " REPO_URL
  git clone "${REPO_URL}" .
fi

echo "==> [7/8] Install dependencies (frontend repo hosts the API too)"
npm install --no-audit --no-fund
if [ -d backend ]; then (cd backend && npm install --no-audit --no-fund); fi

echo "==> [8/8] Placeholders created"
[ -f .env ] || cp deploy/env.production.template .env
echo "  -> Edit /opt/greggory-app/.env now (DB pass, JWT secrets, FRONTEND_URL)."
echo "     Then continue with deploy/README.md steps 5 onward."
echo "DONE. Next: import database, pm2 start deploy/ecosystem.config.js, nginx config."
