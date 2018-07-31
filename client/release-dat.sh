#!/bin/bash
GROUP="$1"
CONTENT_PATH="$2"
RELEASE_TYPE="$3"
RELEASE_DIR="/tangerine/client/releases/$RELEASE_TYPE/dat/$GROUP"

echo "RELEASE_DIR: $RELEASE_DIR"

if [ "$GROUP" = "" ] || [ "$CONTENT_PATH" = "" ] || [ "$RELEASE_TYPE" = "" ]; then
  echo ""
  echo "RELEASE PWA"
  echo "A command for releasing a PWA using a secret URL."
  echo ""
  echo "./release-dat.sh <group> <content path> <release type>"
  echo ""
  echo "Release type is either qa or prod."
  echo ""
  echo "Usage:"
  echo "  ./release-dat.sh a4uw93 ./content/groups/group-a prod"
  echo ""
  echo ""
  echo ""
  exit
fi

TMP_DIR="/.dat-tmp-$GROUP"
mkdir $TMP_DIR

# Get the code.
cp -r /tangerine/client/app/dist/tangerine-client/* $TMP_DIR/
rm -r $TMP_DIR/assets

# Get the content.
cp -r $CONTENT_PATH $TMP_DIR/assets

if [ -d $RELEASE_DIR ]; then
  rm -r $RELEASE_DIR/*
  cp -r $TMP_DIR/* $RELEASE_DIR/
fi

if [ ! -d $RELEASE_DIR ]; then
  cp -r $TMP_DIR $RELEASE_DIR
fi

rm -r $TMP_DIR