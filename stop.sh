#!/usr/bin/env bash
# stop dev server
cd "$(dirname "$0")"

PID_FILE=".server.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "No PID file, server not started via start.sh"
  exit 0
fi

PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "Server stopped (PID $PID)"
else
  echo "No process at PID $PID (already stopped)"
fi

rm -f "$PID_FILE"
