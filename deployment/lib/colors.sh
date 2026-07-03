#!/usr/bin/env bash

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
WHITE="\033[1;37m"
NC="\033[0m"

info() {
    echo -e "${CYAN}$*${NC}"
}

success() {
    echo -e "${GREEN}✔ $*${NC}"
}

warn() {
    echo -e "${YELLOW}⚠ $*${NC}"
}

error() {
    echo -e "${RED}✖ $*${NC}"
}

title() {
    echo
    echo -e "${WHITE}============================================================${NC}"
    echo -e "${WHITE}$*${NC}"
    echo -e "${WHITE}============================================================${NC}"
}