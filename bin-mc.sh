#!/bin/bash

# Mission Control Shortcut
# Copy to ~/bin or add alias to .zshrc:
# alias mc="bash ~/path/to/mission-control/bin-mc.sh"

PROJECT_DIR="/Users/jd/Library/Mobile Documents/com~apple~CloudDocs/0ne/02 - Projects/mission-control"

cd "$PROJECT_DIR" && bun mission-control-cli.ts "$@"
