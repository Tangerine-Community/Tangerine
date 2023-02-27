#!/bin/sh

echo "Running entrypoint-server.sh"

#if [ ! -d data ]; then
#  mkdir data
#  IS_INSTALLING="true"
#fi
#if [ ! -d data/csv ]; then
#  mkdir data/csv
#fi
#if [ ! -d data/archives ]; then
#  mkdir data/archives
#fi
#if [ ! -d data/client ]; then
#  mkdir data/client
#fi
#if [ ! -d data/client/releases ]; then
#  mkdir data/client/releases
#fi
#if [ ! -d data/client/releases/prod ]; then
#  mkdir data/client/releases/prod
#fi
#if [ ! -d data/client/releases/prod/apks ]; then
#  mkdir data/client/releases/prod/apks
#fi
#if [ ! -d data/client/releases/prod/pwas ]; then
#  mkdir data/client/releases/prod/pwas
#fi
#if [ ! -d data/client/releases/qa ]; then
#  mkdir data/client/releases/qa
#fi
#if [ ! -d data/client/releases/qa/apks ]; then
#  mkdir data/client/releases/qa/apks
#fi
#if [ ! -d data/client/releases/qa/pwas ]; then
#  mkdir data/client/releases/qa/pwas
#fi
#if [ ! -d data/client/releases/prod/dat ]; then
#  mkdir data/client/releases/prod/dat
#fi
#if [ ! -d data/client/releases/qa/dat ]; then
#  mkdir data/client/releases/qa/dat
#fi
#if [ ! -f data/id_rsa ]; then
#  echo '' > data/id_rsa
#fi
#if [ ! -f data/id_rsa.pub ]; then
#  echo '' > data/id_rsa.pub
#fi
#if [ ! -f data/reporting-worker-state.json ]; then
#  echo '{}' > data/reporting-worker-state.json
#fi
#if [ ! -f data/paid-worker-state.json ]; then
#  echo '{}' > data/paid-worker-state.json
#fi
#if [ ! -d data/dat-output ]; then
#  mkdir data/dat-output
#fi

cd /tangerine/server/

echo "DEBUG = $DEBUG";

if [ "$DEBUG" ];
then
  echo "Starting server in dev mode"
  npm start:dev
else
  echo "Starting server in production mode."
  npm start
fi