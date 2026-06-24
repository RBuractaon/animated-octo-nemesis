#!/usr/bin/env python3
"""
WC 2026 all-in-one server for rogtowerdb.

Serves two things on a single port (default 5173):
  /           → static files from ../dist/  (the built React app)
  /api/data   → live scores from openfootball, cached 5 min

No pip dependencies — stdlib only. Works on Windows and Linux.

Usage:
    python3 server/serve.py            # port 5173
    python3 server/serve.py 8888       # custom port
"""

import http.server
import urllib.request
import json
import os
import sys
import time
import threading
import mimetypes

# ── Config ────────────────────────────────────────────────────────────────────

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR  = os.path.join(SCRIPT_DIR, '..', 'dist')

OPENFOOTBALL_URL = (
    'https://raw.githubusercontent.com/openfootball/worldcup.json'
    '/master/2026/worldcup.json'
)

CACHE_TTL = 300   # seconds between score refreshes

# ── Score cache ───────────────────────────────────────────────────────────────

_cache_lock = threading.Lock()
_cache = {'data': None, 'ts': 0, 'source': ''}


def _fetch_scores():
    req = urllib.request.Request(
        OPENFOOTBALL_URL + '?t=' + str(int(time.time())),
        headers={'User-Agent': 'wc2026-server/1.0'}
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        raw = r.read()
    data = json.loads(raw)
    completed = sum(1 for m in data.get('matches', []) if m.get('score'))
    return data, f'openfootball · {completed} matches with scores'


def get_scores():
    with _cache_lock:
        age = time.time() - _cache['ts']
        if _cache['data'] is None or age > CACHE_TTL:
            try:
                data, src = _fetch_scores()
                _cache['data'] = data
                _cache['ts']   = time.time()
                _cache['source'] = src
                print(f'[data] refreshed: {src}')
            except Exception as exc:
                print(f'[data] fetch failed: {exc}')
        return _cache['data'], _cache['source']

# ── Request handler ───────────────────────────────────────────────────────────

class Handler(http.server.BaseHTTPRequestHandler):

    def do_GET(self):
        path = self.path.split('?')[0]

        # ── Data API ──────────────────────────────────────────────────────────
        if path in ('/api/data', '/api/wc2026.json', '/wc2026.json'):
            self._serve_scores()
            return

        # ── Healthcheck ───────────────────────────────────────────────────────
        if path == '/health':
            self._json(200, {'ok': True, 'port': PORT})
            return

        # ── Static files (React app) ──────────────────────────────────────────
        # SPA: unknown paths → index.html
        fs_path = os.path.normpath(os.path.join(STATIC_DIR, path.lstrip('/')))
        if not fs_path.startswith(os.path.abspath(STATIC_DIR)):
            self._send(403, 'text/plain', b'Forbidden')
            return

        if os.path.isdir(fs_path):
            fs_path = os.path.join(fs_path, 'index.html')
        if not os.path.isfile(fs_path):
            fs_path = os.path.join(STATIC_DIR, 'index.html')   # SPA fallback

        mime, _ = mimetypes.guess_type(fs_path)
        mime = mime or 'application/octet-stream'
        try:
            with open(fs_path, 'rb') as f:
                body = f.read()
            cache_hdr = 'no-cache' if fs_path.endswith('index.html') else 'public, max-age=604800, immutable'
            self._send(200, mime, body, extra={'Cache-Control': cache_hdr})
        except FileNotFoundError:
            self._send(404, 'text/plain', b'Not found')

    def _serve_scores(self):
        data, source = get_scores()
        if data is None:
            self._json(503, {'error': 'upstream fetch failed'})
            return
        body = json.dumps(data).encode()
        self._send(200, 'application/json', body,
                   extra={'X-Score-Source': source})

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self._send(code, 'application/json', body)

    def _send(self, code, mime, body, extra=None):
        self.send_response(code)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f'[http] {self.address_string()} – {fmt % args}')


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if not os.path.isdir(STATIC_DIR):
        print(f'[warn] dist/ not found at {STATIC_DIR}')
        print('       Run "npm run build" inside wc2026/ first.')
        print('       Serving data API only (static files will 404).')

    print(f'[boot] pre-fetching scores...')
    get_scores()

    server = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    print(f'[boot] listening on 0.0.0.0:{PORT}')
    print(f'       App  → http://100.115.169.40:{PORT}/')
    print(f'       Data → http://100.115.169.40:{PORT}/api/data')
    print(f'       Stop with Ctrl-C')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n[boot] stopped')
