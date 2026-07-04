#!/usr/bin/env bash

set -e

source deployment/lib/colors.sh
source deployment/lib/common.sh
source deployment/lib/docker.sh

title "ALPHABETA PRODUCTION STATUS"

# ── Git ──────────────────────────────────────────────────────────────
echo
info "Git"
echo "  Branch : $(git branch --show-current)"
echo "  Commit : $(git rev-parse --short HEAD)"
echo "  Date   : $(git log -1 --format='%ci')"

# ── Containers ───────────────────────────────────────────────────────
echo
info "Containers"
container_status alphabetawebsite-web
container_status alphabetawebsite-cms
container_status alphabetawebsite-nginx
container_status alphabetawebsite-db

# ── Restart counts ───────────────────────────────────────────────────
echo
info "Restart counts"
for svc in web cms nginx db; do
  COUNT=$(container_restart_count "alphabetawebsite-${svc}")
  if [[ "$COUNT" == "0" || "$COUNT" == "n/a" ]]; then
    echo "  ✔ alphabetawebsite-${svc}: ${COUNT}"
  else
    echo -e "  ${YELLOW}⚠${NC} alphabetawebsite-${svc}: ${COUNT} restarts"
  fi
done

# ── Disk ─────────────────────────────────────────────────────────────
echo
info "Disk"
df -h / | awk 'NR>0{print "  "$0}'

# ── Memory ───────────────────────────────────────────────────────────
echo
info "Memory"
free -h | awk 'NR>0{print "  "$0}'

# ── Database size ────────────────────────────────────────────────────
echo
info "Database"
DB_SIZE=$(db_size_mb)
echo "  Size: $DB_SIZE"

# ── SSL certificates ─────────────────────────────────────────────────
echo
info "SSL Certificates"
for DOMAIN in alphabeta.com.ly cms.alphabeta.com.ly; do
  EXPIRY=$(echo | openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null \
    | openssl x509 -noout -dates 2>/dev/null \
    | grep notAfter | cut -d= -f2) || EXPIRY="unavailable"
  echo "  ${DOMAIN}: ${EXPIRY:-unavailable}"
done

# ── Uptime ───────────────────────────────────────────────────────────
echo
info "Uptime"
uptime | awk '{print "  "$0}'

echo
success "Status check completed"