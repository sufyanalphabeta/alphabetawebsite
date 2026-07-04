#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
#  AlphaBeta Production Deploy Script
#  Usage: bash deploy.sh [--skip-backup] [--domain DOMAIN]
# ─────────────────────────────────────────────────────────────────────
set -Eeuo pipefail

# ── Defaults ──────────────────────────────────────────────────────────
PROJECT_DIR="/opt/alphabeta/apps/alphabetawebsite"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"
DOMAIN="${DOMAIN:-alphabeta.com.ly}"
CMS_DOMAIN="${CMS_DOMAIN:-cms.alphabeta.com.ly}"
SKIP_BACKUP="${SKIP_BACKUP:-false}"
HEALTH_RETRIES=24        # × 5 s = 2 min max
HEALTH_INTERVAL=5

# ── Colors ────────────────────────────────────────────────────────────
GREEN="\033[32m"  RED="\033[31m"  YELLOW="\033[33m"
BLUE="\033[34m"   CYAN="\033[36m" NC="\033[0m"

ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
info()  { echo -e "${BLUE}➜${NC} $1"; }
step()  { echo; echo -e "${CYAN}━━━ $1 ━━━${NC}"; }
fail()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

# ── Parse arguments ───────────────────────────────────────────────────
for arg in "$@"; do
  case $arg in
    --skip-backup) SKIP_BACKUP=true ;;
    --domain)      shift; DOMAIN="$1" ;;
  esac
done

# ── Pre-flight checks ─────────────────────────────────────────────────
step "Pre-flight checks"

[[ -d "$PROJECT_DIR" ]] || fail "Project directory not found: $PROJECT_DIR"
cd "$PROJECT_DIR"

[[ -f ".env.production" ]] || fail ".env.production not found — abort"
ok ".env.production present"

command -v docker &>/dev/null || fail "docker not installed"
docker info &>/dev/null       || fail "Docker daemon not running"
ok "Docker running"

# Disk: require at least 2 GB free
AVAIL_KB=$(df -k . | awk 'NR==2{print $4}')
(( AVAIL_KB > 2097152 )) || fail "Less than 2 GB disk space available"
ok "Disk space OK ($(( AVAIL_KB / 1024 / 1024 )) GB free)"

# ── Git checks ────────────────────────────────────────────────────────
step "Git"

if ! git diff --quiet || ! git diff --cached --quiet; then
  fail "Uncommitted local changes — commit or stash first"
fi
ok "Working tree clean"

PREV_COMMIT=$(git rev-parse HEAD)
info "Current: $(git log --oneline -1)"

info "Pulling latest from origin main..."
git pull origin main || fail "git pull failed"

NEW_COMMIT=$(git rev-parse HEAD)
if [[ "$PREV_COMMIT" == "$NEW_COMMIT" ]]; then
  warn "No new commits pulled — deploying same version"
fi
ok "At commit: $(git rev-parse --short HEAD)"

# ── Rollback function ─────────────────────────────────────────────────
rollback() {
  local EXIT_CODE=$?
  if [[ $EXIT_CODE -ne 0 ]]; then
    echo
    warn "Deployment failed (exit $EXIT_CODE) — rolling back to $PREV_COMMIT"
    git checkout "$PREV_COMMIT" -- . 2>/dev/null || true
    $COMPOSE up -d --build 2>/dev/null || true
    echo -e "${RED}✗ Rollback complete — investigate and redeploy${NC}"
  fi
}
trap rollback ERR

# ── Backup ────────────────────────────────────────────────────────────
if [[ "$SKIP_BACKUP" == "false" ]]; then
  step "Database backup"
  if [[ -x "deployment/backups/backup-postgres.sh" ]]; then
    bash deployment/backups/backup-postgres.sh \
      && ok "Database backup completed" \
      || warn "Backup script failed — proceeding anyway"
  else
    warn "Backup script not found — skipping"
  fi
fi

# ── Build ─────────────────────────────────────────────────────────────
step "Building containers"
$COMPOSE build --pull || fail "Docker build failed"
ok "Build completed"

# ── Deploy ────────────────────────────────────────────────────────────
step "Starting containers"
$COMPOSE up -d || fail "docker compose up failed"
ok "Containers started"

# ── Database migration ────────────────────────────────────────────────
step "Database migrations"
$COMPOSE exec -T cms pnpm strapi migrate:run 2>/dev/null \
  && ok "Migrations applied" \
  || warn "Migration step skipped or not applicable"

# ── Health checks ─────────────────────────────────────────────────────
step "Health checks"

wait_for_service() {
  local NAME="$1"
  local URL="$2"
  local TRIES=0

  info "Waiting for $NAME ($URL)…"
  while (( TRIES < HEALTH_RETRIES )); do
    if curl -fsSL --max-time 5 "$URL" &>/dev/null; then
      ok "$NAME is healthy"
      return 0
    fi
    (( TRIES++ ))
    sleep "$HEALTH_INTERVAL"
    echo -n "."
  done
  echo
  fail "$NAME did not become healthy after $(( HEALTH_RETRIES * HEALTH_INTERVAL ))s"
}

wait_for_service "Web"   "https://$DOMAIN"
wait_for_service "CMS"   "https://$CMS_DOMAIN"

# ── Container status ─────────────────────────────────────────────────
step "Container status"
$COMPOSE ps

# ── Done ─────────────────────────────────────────────────────────────
echo
echo "════════════════════════════════════════"
ok "Deployment successful"
echo "  Commit : $(git rev-parse --short HEAD)"
echo "  Web    : https://$DOMAIN"
echo "  CMS    : https://$CMS_DOMAIN"
echo "════════════════════════════════════════"
echo

