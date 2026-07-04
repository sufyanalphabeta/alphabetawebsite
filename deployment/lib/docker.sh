#!/usr/bin/env bash

# ── container_status NAME ─────────────────────────────────────────────
# Print a one-line status line for a container whose name contains NAME.
# Exits with 0 if running, 1 if not.
container_status() {
  local NAME="$1"
  local LINE

  LINE=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "$NAME" || true)

  if [[ -z "$LINE" ]]; then
    # Check if stopped
    local STOPPED
    STOPPED=$(docker ps -a --format "{{.Names}}\t{{.Status}}" | grep "$NAME" || true)
    if [[ -n "$STOPPED" ]]; then
      echo -e "  \033[31m✖\033[0m $NAME — STOPPED"
    else
      echo -e "  \033[33m?\033[0m $NAME — NOT FOUND"
    fi
    return 1
  fi

  # Detect (healthy) vs (unhealthy)
  if echo "$LINE" | grep -q "(healthy)"; then
    echo -e "  \033[32m✔\033[0m $LINE"
  elif echo "$LINE" | grep -q "(unhealthy)"; then
    echo -e "  \033[31m✖\033[0m $LINE"
    return 1
  else
    echo -e "  \033[32m✔\033[0m $LINE"
  fi
}

# ── container_logs NAME LINES ─────────────────────────────────────────
container_logs() {
  local NAME="$1"
  local LINES="${2:-20}"
  local ID
  ID=$(docker ps -q --filter "name=$NAME" | head -1)
  [[ -n "$ID" ]] && docker logs --tail="$LINES" "$ID" 2>&1 || true
}

# ── container_restart_count NAME ──────────────────────────────────────
container_restart_count() {
  local NAME="$1"
  docker inspect --format="{{.RestartCount}}" \
    "$(docker ps -q --filter name="$NAME" | head -1)" 2>/dev/null || echo "n/a"
}