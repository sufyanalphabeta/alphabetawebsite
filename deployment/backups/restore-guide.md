# ALPHABETA — Backup Restore Guide

> **IMPORTANT:** Test restores regularly in a staging environment. An untested backup is not a backup.

---

## Overview

| What | Tool | Location |
|------|------|----------|
| PostgreSQL database | `pg_restore` / `psql` | `backups/postgres/alphabeta_db_*.sql.gz` |
| Strapi uploads (media/PDFs) | `tar` | `backups/uploads/alphabeta_uploads_*.tar.gz` |

---

## Restore PostgreSQL Database

### 1. List available backups

```bash
ls -lh backups/postgres/alphabeta_db_*.sql.gz | tail -10
```

### 2. Stop the CMS (prevent writes during restore)

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production stop cms
```

### 3. Restore the database

```bash
# Set the backup file you want to restore
BACKUP_FILE="backups/postgres/alphabeta_db_20260613_020000.sql.gz"
source .env.production

# Drop and recreate the database
docker compose -f docker-compose.prod.yml --env-file .env.production \
    exec -T db psql -U "$DATABASE_USERNAME" -c \
    "DROP DATABASE IF EXISTS ${DATABASE_NAME}; CREATE DATABASE ${DATABASE_NAME};"

# Restore from backup
gunzip -c "$BACKUP_FILE" | \
docker compose -f docker-compose.prod.yml --env-file .env.production \
    exec -T db psql -U "$DATABASE_USERNAME" "$DATABASE_NAME"
```

### 4. Restart CMS

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production start cms
```

### 5. Verify restore

```bash
# Check row counts
docker compose -f docker-compose.prod.yml --env-file .env.production \
    exec -T db psql -U "$DATABASE_USERNAME" "$DATABASE_NAME" \
    -c "SELECT count(*) FROM \"software-products_software_products_v\";" 2>/dev/null || \
    echo "Check CMS logs for seed output"

# Tail CMS logs to confirm bootstrap seed ran
docker compose -f docker-compose.prod.yml logs --tail=50 cms
```

---

## Restore Uploads (Media Files)

### 1. List available backups

```bash
ls -lh backups/uploads/alphabeta_uploads_*.tar.gz | tail -5
```

### 2. Stop CMS

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production stop cms
```

### 3. Clear the existing uploads volume and restore

```bash
BACKUP_FILE="backups/uploads/alphabeta_uploads_20260613_023000.tar.gz"

# Determine volume name (adjust project name prefix if needed)
VOLUME=$(docker volume ls --format '{{.Name}}' | grep 'strapi_uploads')
echo "Restoring to volume: $VOLUME"

# Restore
docker run --rm \
    -v "${VOLUME}:/data" \
    -v "$(pwd)/backups/uploads:/backup:ro" \
    alpine:latest \
    sh -c "rm -rf /data/* && tar xzf /backup/$(basename $BACKUP_FILE) -C /data"

echo "✓ Uploads restored"
```

### 4. Restart CMS

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production start cms
```

---

## Full Disaster Recovery

> Use when the entire VPS is lost and you are rebuilding on a new server.

```bash
# 1. Provision new Ubuntu 24.04 VPS, install Docker
# 2. Clone repository
git clone https://github.com/sufyanalphabeta/alphabetawebsite.git alphabeta-corporate
cd alphabeta-corporate

# 3. Restore environment
cp .env.production.example .env.production
nano .env.production   # fill in all secrets (use same secrets as before!)

# 4. Copy backup files to server
scp -r /local/backups/postgres user@new-server:~/alphabeta-corporate/backups/
scp -r /local/backups/uploads  user@new-server:~/alphabeta-corporate/backups/

# 5. Initialize SSL (after DNS records point to new server)
chmod +x deployment/init-ssl.sh
./deployment/init-ssl.sh

# 6. Start only the database first
docker compose -f docker-compose.prod.yml --env-file .env.production up -d db
sleep 10

# 7. Restore the database
BACKUP_FILE="backups/postgres/alphabeta_db_LATEST.sql.gz"   # your latest backup
source .env.production
gunzip -c "$BACKUP_FILE" | \
    docker compose -f docker-compose.prod.yml --env-file .env.production \
    exec -T db psql -U "$DATABASE_USERNAME" "$DATABASE_NAME"

# 8. Start all services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 9. Restore uploads
UPLOADS_BACKUP="backups/uploads/alphabeta_uploads_LATEST.tar.gz"
VOLUME=$(docker volume ls --format '{{.Name}}' | grep 'strapi_uploads')
docker run --rm \
    -v "${VOLUME}:/data" \
    -v "$(pwd)/backups/uploads:/backup:ro" \
    alpine:latest \
    sh -c "rm -rf /data/* && tar xzf /backup/$(basename $UPLOADS_BACKUP) -C /data"

# 10. Verify
curl -sI https://alphabeta.com.ly | head -5
curl -sI https://cms.alphabeta.com.ly/api/software-products | head -5
```

---

## Backup Cron Schedule

Add to crontab (`crontab -e`) on the production server:

```cron
# ALPHABETA backups
# PostgreSQL — daily at 02:00
0 2 * * * cd /path/to/alphabeta-corporate && ./deployment/backups/backup-postgres.sh >> /var/log/alphabeta-backup.log 2>&1

# Uploads — daily at 02:30
30 2 * * * cd /path/to/alphabeta-corporate && ./deployment/backups/backup-uploads.sh >> /var/log/alphabeta-backup.log 2>&1

# SSL renewal — twice weekly (Let's Encrypt certs expire every 90 days)
0 3 * * 1,4 cd /path/to/alphabeta-corporate && docker compose -f docker-compose.prod.yml --env-file .env.production run --rm certbot renew --quiet && docker compose -f docker-compose.prod.yml --env-file .env.production exec nginx nginx -s reload >> /var/log/alphabeta-ssl.log 2>&1
```

---

## Retention Policy

| Backup Type | Retention |
|-------------|-----------|
| Daily database | 30 days |
| Weekly database (Sunday) | 12 weeks |
| Monthly database (1st) | 12 months |
| Daily uploads | 14 days |

---

## Testing Your Backup

Run monthly:

```bash
# 1. Create a test restore environment
docker run -d --name pg-test \
    -e POSTGRES_DB=test_restore \
    -e POSTGRES_USER=test_user \
    -e POSTGRES_PASSWORD=test_pass \
    postgres:16-alpine

sleep 5

# 2. Restore the latest backup into it
gunzip -c backups/postgres/alphabeta_db_LATEST.sql.gz | \
    docker exec -i pg-test psql -U test_user test_restore

# 3. Check row count of a key table
docker exec pg-test psql -U test_user test_restore \
    -c "SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 10;"

# 4. Cleanup
docker rm -f pg-test
echo "✓ Backup restore test passed"
```
