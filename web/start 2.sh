#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔨 Building Mission Control web UI..."
bun run build

echo ""
echo "🚀 Starting Mission Control at http://localhost:3000"
echo "   Pin this to your browser bookmarks!"
echo ""

bun run server/server.ts
