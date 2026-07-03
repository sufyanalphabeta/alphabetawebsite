#!/usr/bin/env bash

set -e

source deployment/lib/colors.sh
source deployment/lib/common.sh
source deployment/lib/docker.sh

title "ALPHABETA PRODUCTION STATUS"

echo

info "Git"

echo "Branch : $(git branch --show-current)"
echo "Commit : $(git rev-parse --short HEAD)"

echo

info "Docker"

docker ps

echo

info "Disk"

df -h /

echo

info "Memory"

free -h

echo

info "Uptime"

uptime

echo

info "Containers"

container_status alphabetawebsite-web
container_status alphabetawebsite-cms
container_status alphabetawebsite-nginx
container_status alphabetawebsite-db

echo

success "Status completed"