# ALPHABETA Corporate Portal — Production Deployment Guide

**Target:** Ubuntu 24.04 VPS with Docker installed
**Domains:** `alphabeta.com.ly`, `www.alphabeta.com.ly`, `cms.alphabeta.com.ly`

---

## Architecture

```
Internet
    │
    ▼
[Nginx :80/:443]   ← SSL termination, security headers, rate limiting
    │
    ├── alphabeta.com.ly     → [web:3000]  nginx serving React SPA (static)
    │
    └── cms.alphabeta.com.ly → [cms:1337]  Strapi v5 API + Admin
                                    │
                               [db:5432]   PostgreSQL 16 (internal only)

Docker volumes:
  postgres_data    — PostgreSQL data files
  strapi_uploads   — CMS media files (images, PDFs)
  certbot_conf     — Let's Encrypt certificates
  certbot_www      — ACME challenge webroot

Docker networks:
  internal  — db ↔ cms only (isolated, no internet access)
  proxy     — nginx ↔ cms ↔ web (no direct db access)
```

---

## Prerequisites

On the VPS (Ubuntu 24.04):

```bash
# Docker (if not installed)
curl -fsSL https://get.docker.com | sh
systemctl enable docker
usermod -aG docker $USER
newgrp docker

# Verify
docker --version          # Docker 24+
docker compose version    # Docker Compose v2
```

Firewall:

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (ACME challenge + redirect)
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## Step 1 — Clone Repository

```bash
cd /opt
git clone https://github.com/sufyanalphabeta/alphabetawebsite.git alphabeta-corporate
cd alphabeta-corporate
```

---

## Step 2 — Configure Environment

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill in every value marked `<CHANGE ME>`. To generate secrets:

```bash
# Generate each secret individually:
openssl rand -base64 32

# Generate APP_KEYS (4 values):
echo "$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
```

Required values:

| Variable | Description |
|----------|-------------|
| `DATABASE_PASSWORD` | Strong random password |
| `APP_KEYS` | 4 comma-separated base64 strings |
| `API_TOKEN_SALT` | Random base64 string |
| `ADMIN_JWT_SECRET` | Random base64 string |
| `JWT_SECRET` | Random base64 string |
| `TRANSFER_TOKEN_SALT` | Random base64 string |
| `SMTP_USER` | Brevo login email |
| `SMTP_PASS` | Brevo SMTP key |
| `CERTBOT_EMAIL` | Email for Let's Encrypt cert expiry notices |

Secure the file:

```bash
chmod 600 .env.production
```

---

## Step 3 — Configure DNS

In your domain registrar (or DNS provider), add these A records:

| Record | Type | Value |
|--------|------|-------|
| `alphabeta.com.ly` | A | `<YOUR_VPS_IP>` |
| `www.alphabeta.com.ly` | A | `<YOUR_VPS_IP>` |
| `cms.alphabeta.com.ly` | A | `<YOUR_VPS_IP>` |

Set TTL to 300 (5 minutes) for faster initial propagation.

Verify DNS propagation:

```bash
dig +short alphabeta.com.ly A      # should show your VPS IP
dig +short cms.alphabeta.com.ly A  # should show your VPS IP
```

**Wait for all 3 to resolve before continuing.**

---

## Step 4 — Initialize SSL Certificates

```bash
chmod +x deployment/init-ssl.sh
./deployment/init-ssl.sh
```

This script:
1. Verifies DNS is resolving
2. Creates temporary self-signed certs so nginx can start
3. Starts nginx container
4. Obtains real Let's Encrypt certificates for all 3 domains
5. Reloads nginx with real certs

Expected output:

```
[init-ssl] ✓ alphabeta.com.ly resolves
[init-ssl] ✓ www.alphabeta.com.ly resolves
[init-ssl] ✓ cms.alphabeta.com.ly resolves
[init-ssl] Creating temporary self-signed certificates...
[init-ssl] Starting nginx with temporary certificates...
[init-ssl] Requesting Let's Encrypt certificates...
...
[init-ssl] ══════════════════════════════════
[init-ssl]   SSL certificates installed!
[init-ssl]   ✓ https://alphabeta.com.ly
[init-ssl]   ✓ https://cms.alphabeta.com.ly
```

---

## Step 5 — Start Production Stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Monitor startup:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

Expected sequence:

1. `db` starts and becomes healthy (~10s)
2. `cms` starts, runs database migrations + seed bootstrap (~60-90s)
3. `web` starts after CMS is healthy (~10s)
4. `nginx` routes traffic

Verify CMS bootstrap completed:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs cms | \
    grep -E "\[bootstrap\]|✓|⚠" | tail -20
```

Expected:

```
[bootstrap] Starting ALPHABETA bootstrap...
[bootstrap:permissions] ✓ Permissions ready
[bootstrap:api-tokens] ✓ Tokens ready
[bootstrap:seed] ✓ Seed ready
[bootstrap] ✓ Complete
```

---

## Step 6 — Verify Deployment

```bash
# Homepage
curl -sI https://alphabeta.com.ly | grep "HTTP"         # → 200

# CMS health
curl -s https://cms.alphabeta.com.ly/_health             # → {"status":"UP"} or 204

# Public API
curl -s "https://cms.alphabeta.com.ly/api/software-products?pagination[pageSize]=2" | \
    python3 -m json.tool | grep '"slug"' | head -5

# HTTP redirect
curl -sI http://alphabeta.com.ly | grep "Location"       # → https://alphabeta.com.ly

# Security headers
curl -sI https://alphabeta.com.ly | grep -iE "x-frame|strict-transport|content-type-options"
```

Then open the full preflight checklist:

```bash
cat deployment/preflight-checklist.md
```

---

## Step 7 — Create First Admin User

1. Open `https://cms.alphabeta.com.ly/admin`
2. Complete the registration form (first run only)
3. Save credentials securely

---

## Step 8 — Set Up Automated Backups

```bash
chmod +x deployment/backups/backup-postgres.sh
chmod +x deployment/backups/backup-uploads.sh

# Create backup directories
mkdir -p backups/postgres backups/uploads

# Test backup scripts
./deployment/backups/backup-postgres.sh
./deployment/backups/backup-uploads.sh

# Set up cron jobs
crontab -e
```

Add to crontab (adjust `/opt/alphabeta-corporate` to your path):

```cron
# ALPHABETA Backups
0  2 * * * cd /opt/alphabeta-corporate && ./deployment/backups/backup-postgres.sh >> /var/log/alphabeta-backup.log 2>&1
30 2 * * * cd /opt/alphabeta-corporate && ./deployment/backups/backup-uploads.sh >> /var/log/alphabeta-backup.log 2>&1

# SSL Renewal (twice per week)
0 3 * * 1,4 cd /opt/alphabeta-corporate && docker compose -f docker-compose.prod.yml --env-file .env.production run --rm certbot renew --quiet && docker compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -s reload >> /var/log/alphabeta-ssl.log 2>&1
```

---

## Common Operations

| Task | Command |
|------|---------|
| View all logs | `dc logs -f` |
| Restart CMS | `dc restart cms` |
| Reload nginx | `dc exec nginx nginx -s reload` |
| Check container health | `dc ps` |
| Pull latest code | `git pull && dc up -d --build cms web` |
| Manual DB backup | `./deployment/backups/backup-postgres.sh` |
| Run preflight check | `cat deployment/preflight-checklist.md` |
| Renew SSL | `dc run --rm certbot renew && dc exec nginx nginx -s reload` |

Add this alias to `~/.bashrc`:

```bash
alias dc="docker compose -f /opt/alphabeta-corporate/docker-compose.prod.yml --env-file /opt/alphabeta-corporate/.env.production"
```

---

## Troubleshooting

### CMS won't start

```bash
dc logs cms --tail=50
# Common causes:
# - DB not ready: dc restart cms (DB healthcheck takes ~30s)
# - Bad APP_KEYS format: must be 4 values, comma-separated
# - Port conflict: netstat -tlnp | grep 1337
```

### nginx fails to start

```bash
dc logs nginx --tail=20
# Common causes:
# - SSL cert not found: run deployment/init-ssl.sh first
# - Config syntax error: docker run --rm -v $(pwd)/nginx:/etc/nginx:ro nginx:alpine nginx -t
```

### 502 Bad Gateway

```bash
# Check if upstream service is up
dc ps
dc restart cms  # or web
```

### SSL cert not renewing

```bash
# Check renewal
dc run --rm certbot renew --dry-run

# Force renewal
dc run --rm certbot renew --force-renewal
dc exec nginx nginx -s reload
```

---

## File Structure

```
alphabeta-corporate/
├── apps/
│   ├── cms/              — Strapi v5 CMS
│   └── web/              — React SPA (Vite + TanStack Router)
├── nginx/
│   └── nginx.conf        — Nginx reverse proxy (production)
├── deployment/
│   ├── README.md         — This file
│   ├── init-ssl.sh       — Initial SSL certificate bootstrap
│   ├── runbook.md        — Operations & incident response
│   ├── preflight-checklist.md — Pre-launch verification
│   └── backups/
│       ├── backup-postgres.sh  — Database backup
│       ├── backup-uploads.sh   — Uploads/media backup
│       └── restore-guide.md    — Restore procedures
├── docker-compose.yml         — Development compose
├── docker-compose.prod.yml    — Production compose
├── .env.production.example    — Production env template
└── .gitignore                 — .env files excluded from git
```
