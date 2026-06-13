#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# ALPHABETA — Initial SSL Certificate Bootstrap
# ══════════════════════════════════════════════════════════════════════════════
#
# Run this ONCE on a fresh VPS before starting the full production stack.
# Prerequisites:
#   1. DNS records pointing to this server (A records for all 3 domains)
#   2. .env.production file with CERTBOT_EMAIL set
#   3. Ports 80 and 443 open in firewall
#
# Usage:
#   chmod +x deployment/init-ssl.sh
#   ./deployment/init-ssl.sh
#
# ══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"
DOMAINS=("alphabeta.com.ly" "www.alphabeta.com.ly" "cms.alphabeta.com.ly")
CERT_DIR="/var/lib/docker/volumes/alphabeta-corporate_certbot_conf/_data"
STAGING="${STAGING:-0}"  # set STAGING=1 for Let's Encrypt staging (testing)

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[init-ssl]${NC} $*"; }
warn()    { echo -e "${YELLOW}[init-ssl]${NC} $*"; }
die()     { echo -e "${RED}[init-ssl] ERROR:${NC} $*"; exit 1; }

# ── Pre-flight checks ─────────────────────────────────────────────────────────
[[ -f .env.production ]] || die ".env.production not found. Copy .env.production.example and fill it in."

source .env.production 2>/dev/null || true
[[ -n "${CERTBOT_EMAIL:-}" ]] || die "CERTBOT_EMAIL is not set in .env.production"

info "Checking DNS resolution for all domains..."
for domain in "${DOMAINS[@]}"; do
    if ! getent hosts "$domain" > /dev/null 2>&1; then
        die "DNS not resolving for $domain — add A records and wait for propagation before running this script."
    fi
    info "  ✓ $domain resolves"
done

# ── Step 1: Create dummy self-signed certs so nginx can start ─────────────────
info "Creating temporary self-signed certificates..."
for domain in "alphabeta.com.ly" "cms.alphabeta.com.ly"; do
    LIVE_DIR="$CERT_DIR/live/$domain"
    if [[ ! -f "$LIVE_DIR/fullchain.pem" ]]; then
        $COMPOSE run --rm --entrypoint "" certbot sh -c "
            mkdir -p /etc/letsencrypt/live/$domain && \
            openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
                -keyout /etc/letsencrypt/live/$domain/privkey.pem \
                -out    /etc/letsencrypt/live/$domain/fullchain.pem \
                -subj   '/CN=$domain' 2>/dev/null
        "
        info "  ✓ Dummy cert created for $domain"
    else
        info "  ✓ Cert already exists for $domain — skipping dummy"
    fi
done

# ── Step 2: Create DH parameters (if not present) ────────────────────────────
DH_FILE="$CERT_DIR/ssl-dhparams.pem"
if [[ ! -f "$DH_FILE" ]]; then
    info "Generating DH parameters (this may take a minute)..."
    $COMPOSE run --rm --entrypoint "" certbot sh -c \
        "openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048 2>/dev/null"
    info "  ✓ DH parameters generated"
fi

# ── Step 3: Start nginx with dummy certs ─────────────────────────────────────
info "Starting nginx with temporary certificates..."
$COMPOSE up -d nginx
sleep 3

# ── Step 4: Obtain real Let's Encrypt certificates ───────────────────────────
info "Requesting Let's Encrypt certificates..."
STAGING_FLAG=""
[[ "$STAGING" == "1" ]] && STAGING_FLAG="--staging" && warn "Using Let's Encrypt STAGING — certs will NOT be trusted by browsers"

$COMPOSE run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    $STAGING_FLAG \
    -d alphabeta.com.ly \
    -d www.alphabeta.com.ly

$COMPOSE run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    $STAGING_FLAG \
    -d cms.alphabeta.com.ly

# ── Step 5: Reload nginx with real certs ─────────────────────────────────────
info "Reloading nginx with real certificates..."
$COMPOSE exec nginx nginx -s reload

info ""
info "══════════════════════════════════════════════════════"
info "  SSL certificates installed successfully!"
info "  ✓ https://alphabeta.com.ly"
info "  ✓ https://www.alphabeta.com.ly"
info "  ✓ https://cms.alphabeta.com.ly"
info ""
info "  Now start the full stack:"
info "  $COMPOSE up -d"
info ""
info "  Set up auto-renewal cron:"
info "  crontab -e"
info "  0 3 * * * cd $(pwd) && $COMPOSE run --rm certbot renew --quiet && $COMPOSE exec nginx nginx -s reload"
info "══════════════════════════════════════════════════════"
