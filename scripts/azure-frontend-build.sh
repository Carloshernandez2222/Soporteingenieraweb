#!/bin/bash
# Build del frontend en Azure (POST_BUILD_COMMAND o POST_BUILD_SCRIPT_PATH).
set -e
cd "$(dirname "$0")/.."
cd frontend
npm ci --no-audit --no-fund
npm run build
