#!/bin/sh
set -eu

PYTHON="${PYTHON:-python3}"

"$PYTHON" backend/manage.py migrate --noinput
exec gunicorn --chdir backend config.wsgi:application --bind "0.0.0.0:${PORT:?PORT must be set}"
