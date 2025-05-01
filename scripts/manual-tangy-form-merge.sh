# This script does a manual merge of the tangy-form or tangy-form-editor repo into Tangerine v4 branches
# It is needed since the tangy-form and tangy-form-editor repos are now in the Tangerine monorepo

# This script is intended to be run from the root of the Tangerine monorepo

#!/bin/bash

# input args are a path to a repo and a tag
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <path-to-tangy-form-or-tangy-form-editor-repo> <tag>"
    exit 1
fi
REPO_PATH=$1
TAG=$2
REPO_NAME=$(basename $REPO_PATH)

# run 'git branch' to get the current branch name
CURRENT_BRANCH=$(cd $REPO_PATH && git rev-parse --abbrev-ref HEAD)
# check if the current branch is master
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "Error: You must be on the master branch of the $REPO_NAME repo to run this script."
    exit 1
fi

# use git diff --name-only to get a list of files that have changed since the last tag
CHANGED_FILES=$(cd $REPO_PATH && git diff --name-only $TAG)
# check if there are any changed files
if [ -z "$CHANGED_FILES" ]; then
    echo "No changed files since $TAG. Nothing to merge."
    exit 0
fi
# copy the changed files to the Tangerine monorepo using cp
for file in $CHANGED_FILES; do
    # get the directory of the file
    DIR=$(dirname $file)
    # copy the file to the Tangerine monorepo
    cp "$REPO_PATH/$file" "$REPO_NAME/$file"
done