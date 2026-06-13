# ALPHABETA — Production Operations Runbook

> This runbook covers day-to-day operations, incident response, and maintenance procedures for the ALPHABETA Corporate Portal.

**Stack:** Strapi v5 CMS | React SPA | PostgreSQL 16 | Nginx | Docker Compose | Ubuntu 24.04

---

## Quick Reference

| Service | Internal URL | Public URL |
|---------|--------------|------------|
| Web (SPA) | `http://web:3000` | `https://alphabeta.com.ly` |
| CMS API | `http://cms:1337/api` | `https://cms.alphabeta.com.ly/api` |
| CMS Admin | `http://cms:1337/admin` | `https://cms.alphabeta.com.ly/admin` |
| Database | `db:5432` | not exposed |

```bash
# Common alias — add to ~/.bashrc on the server
alias dc="docker compose -f /path/to/alphabeta-corporate/docker-compose.prod.yml --env-file /path/to/alphabeta-corporate/.env.production"
```

---

## Service Health Checks

```bash
# Check all container status
dc ps

# Quick health check — all 4 services
dc ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# Check individual service health
curl -sf https://alphabeta.com.ly/health && echo "✓ nginx OK"
curl -sf https://cms.alphabeta.com.ly/_health && echo "✓ CMS OK"
```

---

## Restart Procedures

### Restart a single service (zero-downtime order)

```bash
# Restart CMS (graceful — waits for health check)
dc restart cms

# Restart web (instant — static files, no state)
dc restart web

# Restart nginx (reloads config without downtime)
dc exec nginx nginx -s reload
# or full restart:
dc restart nginx
```

### Restart entire stack

```bash
dc down
dc up -d
# Monitor startup
dc logs -f --tail=50
```

### Restart after code update (see Upgrade Procedures)

```bash
dc up -d --build cms web
```

---

## Upgrade Procedures

### Regular content/code update (no schema change)

```bash
cd /path/to/alphabeta-corporate
git pull origin main
dc up -d --build --no-deps cms web
dc logs -f cms | grep -E "(bootstrap|Seed|error|Error)" | head -30
```

### Update with Strapi schema changes

```bash
# 1. Pull new code
git pull origin main

# 2. Build new images WITHOUT starting them
dc build cms web

# 3. Take a database backup first
./deployment/backups/backup-postgres.sh

# 4. Roll out CMS first (Strapi runs migrations on start)
dc up -d --no-deps cms
dc logs -f cms | grep -E "(\[bootstrap\]|error|migration)" | head -50

# 5. Verify CMS health, then roll out web
dc ps cms
dc up -d --no-deps web
```

### Nginx config update

```bash
# Edit nginx/nginx.conf then:
dc exec nginx nginx -t          # test config syntax
dc exec nginx nginx -s reload   # reload without downtime
```

### SSL certificate renewal (manual)

```bash
dc run --rm certbot renew
dc exec nginx nginx -s reload
# Check new expiry
dc run --rm --entrypoint "" certbot sh -c \
    "openssl x509 -in /etc/letsencrypt/live/alphabeta.com.ly/fullchain.pem -noout -dates"
```

---

## Rollback Procedures

### Rollback to previous Docker image

```bash
# Find the previous git commit
git log --oneline -5

# Roll back to previous commit
git checkout <previous-commit-hash>

# Rebuild and redeploy
dc up -d --build cms web

# Or if images were tagged:
# Edit docker-compose.prod.yml to use previous image tag
```

### Rollback database to last backup

See `deployment/backups/restore-guide.md` — "Restore PostgreSQL Database" section.

### Emergency: revert a bad Strapi migration

```bash
# Stop CMS
dc stop cms

# Restore database from last backup
./deployment/backups/restore-guide.md  # follow the restore steps

# Roll back code
git checkout <previous-commit>

# Restart
dc up -d cms
```

---

## Monitoring & Logs

### View logs

```bash
# All services (last 100 lines, follow)
dc logs -f --tail=100

# Specific service
dc logs -f cms
dc logs -f nginx
dc logs -f db

# Filter for errors
dc logs cms 2>&1 | grep -iE "error|warn|fatal"
dc logs nginx 2>&1 | grep " 5[0-9][0-9] "

# Nginx access log (last 50 requests)
dc exec nginx tail -50 /var/log/nginx/access.log

# Nginx error log
dc exec nginx tail -50 /var/log/nginx/error.log
```

### Container resource usage

```bash
docker stats --no-stream
```

### Disk usage

```bash
# Docker volumes
docker system df -v | grep alphabeta

# Backup directory
du -sh backups/postgres backups/uploads

# Database size
dc exec -T db psql -U "$DATABASE_USERNAME" "$DATABASE_NAME" \
    -c "SELECT pg_size_pretty(pg_database_size('$DATABASE_NAME'));"
```

---

## Database Operations

### Connect to database

```bash
source .env.production
dc exec db psql -U "$DATABASE_USERNAME" "$DATABASE_NAME"
```

### Common queries

```sql
-- Check published products
SELECT slug, name_ar, "publishedAt" IS NOT NULL as published
FROM "software-products_software_products_v" 
ORDER BY sort_order;

-- Check admin users
SELECT email, is_active FROM admin_users;

-- Check public permissions count
SELECT count(*) FROM up_permissions WHERE role_id = (
    SELECT id FROM up_roles WHERE type = 'public'
);
```

### Manual backup trigger

```bash
./deployment/backups/backup-postgres.sh
./deployment/backups/backup-uploads.sh
```

---

## Incident Response

### Site is down (alphabeta.com.ly not responding)

```bash
# 1. Check container status
dc ps

# 2. If nginx is down
dc up -d nginx
dc logs nginx --tail=20

# 3. If web is down
dc up -d web
dc logs web --tail=20

# 4. Check SSL cert validity
openssl s_client -connect alphabeta.com.ly:443 -brief 2>/dev/null | grep "Verification"
```

### CMS API returning errors

```bash
# 1. Check CMS logs
dc logs cms --tail=50

# 2. Check DB connectivity
dc exec cms wget -qO- http://localhost:1337/_health

# 3. Restart CMS
dc restart cms

# 4. If DB is down
dc up -d db
sleep 10
dc restart cms
```

### Database corruption / out of disk space

```bash
# Check disk
df -h

# Check PostgreSQL status
dc exec db pg_isready -U "$DATABASE_USERNAME"

# If disk full — clean Docker resources
docker system prune -f  # WARNING: removes stopped containers and unused images
docker volume prune -f   # WARNING: only run if you know which volumes are unused
```

### SSL certificate expired

```bash
# Emergency: get new cert
dc run --rm certbot renew --force-renewal
dc exec nginx nginx -s reload

# Verify
curl -sI https://alphabeta.com.ly | grep -i "strict-transport"
```

---

## Disaster Recovery Summary

| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| Single service restart | 2 min | 0 | `dc restart <service>` |
| Full stack restart | 5 min | 0 | `dc down && dc up -d` |
| Code rollback | 10 min | 0 | `git checkout + dc up --build` |
| DB restore from backup | 30 min | 24h | See restore-guide.md |
| Full VPS migration | 2h | 24h | See restore-guide.md — Disaster Recovery |
| SSL renewal | 5 min | N/A | `certbot renew + nginx reload` |

---

## Maintenance Windows

- **Recommended maintenance window:** Sundays 02:00–04:00 Libya time (low traffic)
- Always take a backup before any schema change
- Always test in dev environment before deploying to production
- Notify via company channels before planned downtime > 5 minutes
