#!/usr/bin/env bash

if [ "$2" = "--help" ]; then
  echo "Usage:"
  echo "  reporting-worker-pause"
  exit 1
fi
touch /reporting-worker-pause
