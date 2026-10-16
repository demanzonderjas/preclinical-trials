#!/usr/bin/env bash
# Starts the app for the end-to-end suite. Set PCT_PHP to use another PHP binary.
set -euo pipefail
cd "$(dirname "$0")/../../public"
export APP_ENV=e2e
exec "${PCT_PHP:-php}" -d pcre.jit=0 -d display_errors=stderr -S "localhost:${PCT_E2E_PORT:-8000}" -t . ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
