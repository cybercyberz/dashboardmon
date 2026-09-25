#!/usr/bin/env bash
# start dev server, background, PID saved
set -e
cd "$(dirname "$0")"

PID_FILE=".server.pid"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Server already running (PID $(cat "$PID_FILE"))"
  exit 0
fi

[ -d node_modules ] || npm install

nohup npx vite > server.log 2>&1 &
echo $! > "$PID_FILE"
echo "Server started (PID $!), log: server.log"
