# ALPHABETA — Production Preflight Checklist

> Complete every item before going live. Check items you can verify, fix items that fail.
> Run this checklist from the VPS that will host production.

---

## 1. DNS

```bash
# Run all DNS checks:
echo "=== DNS Checks ===" && \
dig +short alphabeta.com.ly A && \
dig +short www.alphabeta.com.ly A && \
dig +short cms.alphabeta.com.ly A
```

| Check | Command | Expected |
|-------|---------|----------|
| `alphabeta.com.ly` resolves | `dig +short alphabeta.com.ly A` | Your server IP |
| `www.alphabeta.com.ly` resolves | `dig +short www.alphabeta.com.ly A` | Your server IP |
| `cms.alphabeta.com.ly` resolves | `dig +short cms.alphabeta.com.ly A` | Your server IP |
| DNS propagated globally | https://dnschecker.org/#A/alphabeta.com.ly | Green checkmarks |

- [ ] `alphabeta.com.ly` → server IP
- [ ] `www.alphabeta.com.ly` → server IP
- [ ] `cms.alphabeta.com.ly` → server IP
- [ ] Propagation confirmed (wait 5–30 min after setting records)

---

## 2. SSL Certificates

```bash
# Check certificate validity and expiry:
openssl s_client -connect alphabeta.com.ly:443 -brief 2>/dev/null | head -5
openssl s_client -connect cms.alphabeta.com.ly:443 -brief 2>/dev/null | head -5

# Check expiry dates:
echo | openssl s_client -connect alphabeta.com.ly:443 2>/dev/null | \
    openssl x509 -noout -dates
```

| Check | Expected |
|-------|----------|
| `alphabeta.com.ly` cert valid | Issued by Let's Encrypt |
| `cms.alphabeta.com.ly` cert valid | Issued by Let's Encrypt |
| HTTP redirects to HTTPS | `curl -sI http://alphabeta.com.ly` → 301 |
| `www` redirects to apex | `curl -sI https://www.alphabeta.com.ly` → 301 |
| HSTS header present | `Strict-Transport-Security` in response |
| Expiry > 30 days | `Not After` date |

- [ ] SSL cert for `alphabeta.com.ly` valid
- [ ] SSL cert for `cms.alphabeta.com.ly` valid
- [ ] HTTP → HTTPS redirect working
- [ ] www → apex redirect working
- [ ] HSTS header present
- [ ] SSL cert auto-renewal cron set up

---

## 3. Docker & Containers

```bash
# Check all containers running and healthy:
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# Check health status:
docker compose -f docker-compose.prod.yml --env-file .env.production ps \
    --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
```

| Check | Expected |
|-------|----------|
| `db` container | `Up` / `healthy` |
| `cms` container | `Up` / `healthy` |
| `web` container | `Up` / `healthy` |
| `nginx` container | `Up` / `healthy` |
| No port 1337 on host | `netstat -tlnp \| grep 1337` → empty |
| No port 3000 on host | `netstat -tlnp \| grep 3000` → empty |
| Ports 80/443 on nginx | `netstat -tlnp \| grep -E ':80\|:443'` → nginx |
| `restart: unless-stopped` | Containers survive `docker restart` |

- [ ] All 4 containers running
- [ ] All 4 containers healthy
- [ ] Port 1337 NOT exposed to internet
- [ ] Port 3000 NOT exposed to internet
- [ ] Ports 80 + 443 bound to nginx only

---

## 4. Database

```bash
source .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production \
    exec -T db psql -U "$DATABASE_USERNAME" "$DATABASE_NAME" \
    -c "SELECT count(*) as products FROM \"software-products_software_products_v\" WHERE \"publishedAt\" IS NOT NULL;"
```

| Check | Expected |
|-------|----------|
| DB container healthy | `pg_isready` returns `accepting connections` |
| Can connect from CMS | No DB errors in CMS logs |
| Published products count | 7 (Rakiza ERP, TPA, Alpha Care, Restaurant, Projects, Archive, Attendance) |
| Admin users exist | At least 1 active admin |
| Public permissions set | ≥ 35 public permission rows |

- [ ] Database accessible
- [ ] All 7 real products published
- [ ] Admin account works (test login at https://cms.alphabeta.com.ly/admin)
- [ ] Public permissions granted (bootstrap ran successfully)

---

## 5. Uploads / Media

```bash
# Check uploads volume is mounted and accessible:
docker compose -f docker-compose.prod.yml --env-file .env.production \
    exec cms ls -la /app/apps/cms/public/uploads/ | head -10
```

| Check | Expected |
|-------|----------|
| Uploads volume mounted | Files present in `/app/apps/cms/public/uploads/` |
| Uploads accessible via CMS domain | `curl -sI https://cms.alphabeta.com.ly/uploads/` → 200 or 403 |
| Upload size limit | CMS nginx set to `client_max_body_size 100M` |
| Uploads volume backed up | backup-uploads.sh ran successfully |

- [ ] Uploads directory exists and is mounted
- [ ] Media files accessible via https://cms.alphabeta.com.ly/uploads/
- [ ] Upload size limit configured (100MB)

---

## 6. CMS (Strapi)

```bash
# Check CMS health endpoint:
curl -s https://cms.alphabeta.com.ly/_health

# Check public API returns data:
curl -s "https://cms.alphabeta.com.ly/api/software-products?pagination[pageSize]=3&fields[0]=slug" | \
    python3 -m json.tool | head -20
```

| Check | Expected |
|-------|----------|
| Health endpoint | `{"status":"UP"}` or HTTP 204 |
| Public API works | JSON with software products |
| Admin panel loads | https://cms.alphabeta.com.ly/admin → login page |
| No API token in frontend | No `Authorization: Bearer` header in browser network tab |
| CORS headers correct | `Access-Control-Allow-Origin: https://alphabeta.com.ly` |
| X-Powered-By absent | No `X-Powered-By: Strapi` header |

- [ ] CMS health check passes
- [ ] Public API returns products JSON
- [ ] Admin panel accessible and login works
- [ ] No VITE_STRAPI_API_TOKEN baked into frontend bundle
- [ ] X-Powered-By header removed
- [ ] CORS limited to production domains

---

## 7. Frontend (React SPA)

```bash
# Check frontend loads:
curl -sI https://alphabeta.com.ly | head -20

# Check security headers:
curl -sI https://alphabeta.com.ly | grep -iE "(x-frame|strict-transport|content-type|referrer)"
```

| Check | Expected |
|-------|----------|
| Homepage loads | HTTP 200 |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=63072000` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| Static assets cached | `Cache-Control: public, immutable` on `.js`/`.css` files |
| Products load on homepage | Arabic product cards visible |
| Product detail pages work | `/software/rakiza-erp-system` loads correctly |
| Dark mode toggle works | `ab-theme` localStorage key toggles `.dark` class |
| Contact form submits | POST to `/api/contact-submissions` returns 200 |

- [ ] Homepage loads at https://alphabeta.com.ly
- [ ] All security headers present
- [ ] Static assets served with 1-year cache
- [ ] Products load from CMS
- [ ] Product detail pages work
- [ ] Dark mode toggle works
- [ ] Contact form submits successfully

---

## 8. Backups

```bash
# Run backup scripts and verify output:
./deployment/backups/backup-postgres.sh
./deployment/backups/backup-uploads.sh

# List backup files:
ls -lh backups/postgres/ backups/uploads/

# Verify cron is set up:
crontab -l
```

| Check | Expected |
|-------|----------|
| Database backup runs | `.sql.gz` file created in `backups/postgres/` |
| Uploads backup runs | `.tar.gz` file created in `backups/uploads/` |
| Backup sizes reasonable | DB > 1MB, uploads > 0 bytes |
| Cron jobs configured | Daily at 02:00 and 02:30 |
| Backup permissions | `chmod 600` on backup files |

- [ ] Database backup script runs successfully
- [ ] Uploads backup script runs successfully
- [ ] Cron jobs configured and verified with `crontab -l`
- [ ] Backup retention tested (old backups pruned)

---

## 9. Email (SMTP)

```bash
# Test email by submitting the contact form on the website and checking email delivery
# Or use Strapi admin: Settings → Email → Test
```

| Check | Expected |
|-------|----------|
| `SMTP_USER` set | Non-empty in .env.production |
| `SMTP_PASS` set | Non-empty in .env.production |
| Test email delivered | Contact form submission triggers email to info@alphabeta.ly |

- [ ] SMTP credentials configured
- [ ] Test email received

---

## 10. Environment Variables

```bash
# Check all required vars are set (no empty values):
source .env.production
for var in DATABASE_NAME DATABASE_USERNAME DATABASE_PASSWORD \
           APP_KEYS API_TOKEN_SALT ADMIN_JWT_SECRET JWT_SECRET TRANSFER_TOKEN_SALT \
           SMTP_USER SMTP_PASS CERTBOT_EMAIL; do
    val="${!var:-}"
    if [[ -z "$val" || "$val" == *"<CHANGE ME>"* ]]; then
        echo "❌ MISSING: $var"
    else
        echo "✓ $var is set"
    fi
done
```

| Variable | Required | Check |
|----------|----------|-------|
| `DATABASE_PASSWORD` | Yes | Not a dev/example value |
| `APP_KEYS` | Yes | 4 comma-separated base64 strings |
| `API_TOKEN_SALT` | Yes | Random base64 string |
| `ADMIN_JWT_SECRET` | Yes | Random base64 string |
| `JWT_SECRET` | Yes | Random base64 string |
| `TRANSFER_TOKEN_SALT` | Yes | Random base64 string |
| `SMTP_USER` | Yes | Brevo login email |
| `SMTP_PASS` | Yes | Brevo SMTP key |
| `CERTBOT_EMAIL` | Yes | Valid email for cert expiry notices |

- [ ] All required environment variables set
- [ ] No placeholder values (`<CHANGE ME>`) remaining
- [ ] `.env.production` file permissions set to 600 (`chmod 600 .env.production`)
- [ ] `.env.production` NOT committed to git (verify with `git status`)

---

## Final Sign-off

Before going live:

- [ ] All 10 sections above checked ✓
- [ ] Admin password changed from default (`Alphabeta@2026`)
- [ ] First backup verified (restore tested in isolation)
- [ ] Monitoring/uptime check configured (UptimeRobot or similar)
- [ ] DNS TTL reduced before launch, restored after
- [ ] Team informed of launch time

**Signed off by:** ___________________  **Date:** ___________________
