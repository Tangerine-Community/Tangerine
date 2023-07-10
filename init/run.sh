#!/bin/sh

# Persistent Volume is mounted here
#cd /tangerine

# to make the data dirs
echo "hello!"
#if [ ! -d data ]; then
#  mkdir data
#  IS_INSTALLING="true"
#fi
#if [ ! -d /csv ]; then
#  mkdir /csv
#fi
#if [ ! -d /archives ]; then
#  mkdir /archives
#fi
#if [ ! -d /tangerine/client ]; then
#  mkdir /tangerine/client
#fi
#if [ ! -d /tangerine/client/releases ]; then
#  mkdir /tangerine/client/releases
#fi
#if [ ! -d /tangerine/client/releases/prod ]; then
#  mkdir /tangerine/client/releases/prod
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
if [ ! -f /root/.ssh/id_rsa ]; then
  echo "id_rsa!"
  echo '' > /root/.ssh/id_rsa
fi
if [ ! -f /root/.ssh/id_rsa.pub ]; then
  echo "id_rsa.pub!"
  echo '' > /root/.ssh/id_rsa.pub
fi
if [ ! -f /tangerine ]; then
  mkdir /tangerine
fi
if [ ! -f /tangerine/state ]; then
  mkdir /tangerine/state
fi
if [ ! -f /state/reporting-worker-state.json ]; then
  echo '{}' > /tangerine/state/reporting-worker-state.json
fi
if [ ! -f /state/paid-worker-state.json ]; then
  echo '{}' > /tangerine/state/paid-worker-state.json
fi
#if [ ! -d data/dat-output ]; then
#  mkdir data/dat-output
#fi

# To handle the files from the repo
#cp -r /fromRepo/* .
