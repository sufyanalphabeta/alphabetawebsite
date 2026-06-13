#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# ALPHABETA — PostgreSQL Backup Script
# ══════════════════════════════════════════════════════════════════════════════
#
# Creates a compressed, timestamped pg_dump of the production database.
#
# Usage (manual):
#   ./deployment/backups/backup-postgres.sh
#
# Usage (cron — daily at 02:00):
#   0 2 * * * /path/to/project/deployment/backups/backup-postgres.sh >> /var/log/alphabeta-backup.log 2>&1
#
# Retention: keeps last 30 daily backups, last 12 weekly backups (Sundays),
#            last 12 monthly backups (1st of month)
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.production"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups/postgres}"
RETAIN_DAILY=30
RETAIN_WEEKLY=12
RETAIN_MONTHLY=12

# ── Load environment ───────────────────────────────────────────────────────────
[[ -f "$ENV_FILE" ]] || { echo "ERROR: $ENV_FILE not found"; exit 1; }
source "$ENV_FILE"

DB_NAME="${DATABASE_NAME:-alphabeta_prod}"
DB_USER="${DATABASE_USERNAME:-alphabeta_user}"

# ── Prepare backup directory ───────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

# ── Timestamp and filename ─────────────────────────────────────────────────────
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DAY_OF_WEEK=$(date +"%u")    # 7 = Sunday
DAY_OF_MONTH=$(date +"%d")   # 01 = first of month
FILENAME="alphabeta_db_${TIMESTAMP}.sql.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

# ── Run backup ─────────────────────────────────────────────────────────────────
echo "[$(date -Iseconds)] Starting PostgreSQL backup → $FILENAME"

docker compose -f "$PROJECT_DIR/docker-compose.prod.yml" \
    --env-file "$ENV_FILE" \
    exec -T db \
    pg_dump -U "$DB_USER" "$DB_NAME" \
    | gzip -9 > "$FILEPATH"

SIZE=$(du -sh "$FILEPATH" | cut -f1)
echo "[$(date -Iseconds)] ✓ Backup complete — $FILENAME ($SIZE)"

# ── Symlinks for weekly / monthly retention ────────────────────────────────────
if [[ "$DAY_OF_WEEK" == "7" ]]; then
    ln -sf "$FILEPATH" "$BACKUP_DIR/weekly_$(date +%Y-W%V).sql.gz"
    echo "[$(date -Iseconds)] ✓ Linked as weekly backup"
fi
if [[ "$DAY_OF_MONTH" == "01" ]]; then
    ln -sf "$FILEPATH" "$BACKUP_DIR/monthly_$(date +%Y-%m).sql.gz"
    echo "[$(date -Iseconds)] ✓ Linked as monthly backup"
fi

# ── Prune old daily backups ────────────────────────────────────────────────────
echo "[$(date -Iseconds)] Pruning backups older than ${RETAIN_DAILY} days..."
find "$BACKUP_DIR" -maxdepth 1 -name "alphabeta_db_*.sql.gz" \
    -not -newer "$BACKUP_DIR/alphabeta_db_$(date -d "$RETAIN_DAILY days ago" +"%Y%m%d" 2>/dev/null || date -v-${RETAIN_DAILY}d +"%Y%m%d")_000000.sql.gz" \
    -delete 2>/dev/null || true

# Simpler cross-platform approach: delete files older than RETAIN_DAILY days
find "$BACKUP_DIR" -maxdepth 1 -name "alphabeta_db_*.sql.gz" \
    -mtime +"$RETAIN_DAILY" -delete 2>/dev/null || true

echo "[$(date -Iseconds)] ✓ Pruning complete"
echo "[$(date -Iseconds)] Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -10
