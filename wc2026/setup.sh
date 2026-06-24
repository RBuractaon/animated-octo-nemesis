#!/usr/bin/env bash
# ── WC 2026 — rogtowerdb first-time setup (Lambda Labs / Ubuntu) ──────────────
# Run once as a regular user (not root). Uses sudo internally where needed.
#
#   chmod +x setup.sh && ./setup.sh

set -euo pipefail
cd "$(dirname "$0")"
REPO_DIR="$(pwd)"

echo ""
echo "  ⚽  WC 2026 Bracket Intelligence — setup"
echo "  ─────────────────────────────────────────"

# ── 1. Node.js (via NodeSource 20.x LTS) ──────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo ""
  echo "  [node] Node.js not found — installing via NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  echo "  [node] $(node --version) installed"
else
  echo "  [node] $(node --version) already present"
fi

# ── 2. npm install ─────────────────────────────────────────────────────────────
echo ""
echo "  [npm] installing packages..."
npm install --silent

# ── 3. Build React app ─────────────────────────────────────────────────────────
echo "  [build] building..."
npm run build
echo "  [build] done → dist/"

# ── 4. systemd service (optional — skip with --no-service) ────────────────────
INSTALL_SERVICE=true
for arg in "$@"; do
  [[ "$arg" == "--no-service" ]] && INSTALL_SERVICE=false
done

if $INSTALL_SERVICE; then
  echo ""
  echo "  [systemd] installing wc2026.service..."

  SERVICE_FILE="/etc/systemd/system/wc2026.service"
  CURRENT_USER="$(whoami)"
  PYTHON="$(command -v python3)"

  sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=WC 2026 Bracket Intelligence
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$REPO_DIR
ExecStart=$PYTHON server/serve.py 5173
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable wc2026
  sudo systemctl restart wc2026

  sleep 1
  STATUS=$(systemctl is-active wc2026 2>/dev/null || echo "unknown")
  echo "  [systemd] wc2026.service → $STATUS"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "  ✓ Setup complete"
echo ""
echo "  App URL  : http://100.115.169.40:5173"
echo "  Data API : http://100.115.169.40:5173/api/data"
echo ""
echo "  Useful commands:"
echo "    sudo systemctl status wc2026     # check if running"
echo "    sudo systemctl restart wc2026    # restart"
echo "    sudo journalctl -u wc2026 -f     # live logs"
echo "    ./start.sh --no-build            # run manually (no service)"
echo ""
