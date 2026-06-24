#!/usr/bin/env bash
# ── WC 2026 Bracket Intelligence — rogtowerdb startup ─────────────────────────
# Builds the React app (if Node is available) then starts the Python server.
# Requires: Python 3.7+  (Node.js optional but needed for first build)
#
# Usage:
#   chmod +x start.sh
#   ./start.sh            # build + serve on port 5173
#   ./start.sh 8888       # custom port
#   ./start.sh --no-build # skip npm steps, just serve existing dist/

set -e
cd "$(dirname "$0")"

PORT="${1:-5173}"
SKIP_BUILD=false
[[ "$1" == "--no-build" ]] && { SKIP_BUILD=true; PORT="${2:-5173}"; }

echo ""
echo "  ⚽ WC 2026 Bracket Intelligence"
echo "  ──────────────────────────────"

# ── Build step ────────────────────────────────────────────────────────────────
if [[ "$SKIP_BUILD" == false ]]; then
  if command -v node &>/dev/null; then
    NODE_VER=$(node --version)
    echo "  [build] Node $NODE_VER found"

    if [[ ! -d node_modules ]]; then
      echo "  [build] installing npm packages..."
      npm install --silent
    fi

    echo "  [build] building React app..."
    npm run build --silent
    echo "  [build] done → dist/"
  else
    if [[ -d dist ]]; then
      echo "  [build] Node not found — using existing dist/ (run 'npm run build' to update)"
    else
      echo "  [error] Node.js is required for the first build."
      echo "          Install: https://nodejs.org  or  sudo apt install nodejs npm"
      exit 1
    fi
  fi
fi

# ── Server ────────────────────────────────────────────────────────────────────
echo ""
echo "  Starting server on port $PORT..."
echo "  Access from any Tailscale device:"
echo "    http://100.115.169.40:$PORT"
echo ""
python3 server/serve.py "$PORT"
