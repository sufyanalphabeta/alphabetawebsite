#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# ALPHABETA — Strapi Uploads Backup Script
# ══════════════════════════════════════════════════════════════════════════════
#
# Creates a compressed, timestamped tar archive of the Strapi uploads volume.
# This covers all media files, PDFs, images uploaded via CMS.
#
# Usage (manual):
#   ./deployment/backups/backup-uploads.sh
#
# Usage (cron — daily at 02:30, 30 min after postgres backup):
#   30 2 * * * /path/to/project/deployment/backups/backup-uploads.sh >> /var/log/alphabeta-backup.log 2>&1
#
# Retention: 14 daily backups (uploads change less frequently than DB)
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.production"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups/uploads}"
RETAIN_DAYS=14

# Docker volume name (project name prefix + volume name)
# docker-compose uses directory name as project name by default
PROJECT_NAME=$(basename "$PROJECT_DIR" | tr '[:upper:]' '[:lower:]' | tr '-' '_')
VOLUME_NAME="${PROJECT_NAME}_strapi_uploads"

# ── Prepare ────────────────────────────────────────────────────────────────────
[[ -f "$ENV_FILE" ]] || { echo "ERROR: $ENV_FILE not found"; exit 1; }
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="alphabeta_uploads_${TIMESTAMP}.tar.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

# ── Run backup using a temporary alpine container ─────────────────────────────
echo "[$(date -Iseconds)] Starting uploads backup → $FILENAME"
echo "[$(date -Iseconds)] Volume: $VOLUME_NAME"

# Check if volume exists
if ! docker volume inspect "$VOLUME_NAME" > /dev/null 2>&1; then
    echo "[$(date -Iseconds)] WARN: Volume $VOLUME_NAME not found."
    echo "                   Trying with 'alphabetacorporate_strapi_uploads'..."
    VOLUME_NAME="alphabetacorporate_strapi_uploads"
fi

docker run --rm \
    -v "${VOLUME_NAME}:/data:ro" \
    -v "$BACKUP_DIR:/backup" \
    alpine:latest \
    tar czf "/backup/$FILENAME" -C /data .

SIZE=$(du -sh "$FILEPATH" | cut -f1)
echo "[$(date -Iseconds)] ✓ Uploads backup complete — $FILENAME ($SIZE)"

# ── Prune old backups ──────────────────────────────────────────────────────────
echo "[$(date -Iseconds)] Pruning uploads backups older than ${RETAIN_DAYS} days..."
find "$BACKUP_DIR" -maxdepth 1 -name "alphabeta_uploads_*.tar.gz" \
    -mtime +"$RETAIN_DAYS" -delete 2>/dev/null || true

echo "[$(date -Iseconds)] ✓ Pruning complete"
echo "[$(date -Iseconds)] Current upload backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -5
