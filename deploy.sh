#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="/opt/alphabeta/apps/alphabetawebsite"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"
BLUE="\033[34m"
NC="\033[0m"

ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
info()  { echo -e "${BLUE}➜${NC} $1"; }
fail()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

cd "$PROJECT_DIR" || fail "Project directory not found"

echo
echo "========================================"
echo "   Alphabeta Production Deployment"
echo "========================================"
echo

info "Current commit:"
git log --oneline -1

echo

info "Checking git status..."

if ! git diff --quiet || ! git diff --cached --quiet; then
    fail "Local changes exist. Commit or stash first."
fi

ok "Working tree clean"

echo

info "Pulling latest changes..."

git pull origin main || fail "Git pull failed"

echo

info "Building containers..."

$COMPOSE up -d --build || fail "Docker build failed"

echo

info "Waiting for containers..."

sleep 15

docker ps

echo

info "Checking website..."

curl -fsSL https://alphabeta.com.ly >/dev/null \
    && ok "Website OK" \
    || fail "Website check failed"

echo

info "Checking CMS..."

curl -fsSL https://cms.alphabeta.com.ly >/dev/null \
    && ok "CMS OK" \
    || fail "CMS check failed"

echo
echo "========================================"
ok "Deployment completed successfully"
echo "========================================"
