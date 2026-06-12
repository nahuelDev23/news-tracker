#!/usr/bin/env bash
set -euo pipefail

response="$(curl -s http://127.0.0.1:4040/api/tunnels)"
public_url="$(node -e "
const data = JSON.parse(process.argv[1]);
const tunnel = data.tunnels?.find((item) => item.public_url?.startsWith('https://'));
console.log(tunnel?.public_url ?? '');
" "$response")"

if [ -z "$public_url" ]; then
  echo "No hay túnel ngrok activo. Ejecuta: npm run tunnel:up" >&2
  exit 1
fi

echo "$public_url"
