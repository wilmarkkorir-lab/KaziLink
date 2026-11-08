#!/usr/bin/env bash
set -e
cd backend
python manage.py migrate --noinput
python manage.py collectstatic --noinput
