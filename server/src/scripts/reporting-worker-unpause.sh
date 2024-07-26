#!/usr/bin/env bash

if [ "$2" = "--help" ]; then
  echo "Usage:"
  echo "  reporting-worker-pause"
  exit 1
fi
rm /reporting-worker-pause
