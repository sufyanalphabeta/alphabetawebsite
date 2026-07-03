#!/usr/bin/env bash

container_status() {

    local NAME="$1"

    docker ps \
    --format "{{.Names}} {{.Status}}" |
    grep "$NAME"

}