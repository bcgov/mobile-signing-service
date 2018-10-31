#!/bin/bash

[[ ! -f x ]] \
  && echo "WARNING: Environment source not found."

source .env

[[ -z "$KEYCHAIN_PWD" ]] \
  && echo "ERROR: Missing keychain password." && exit 1

./scripts/mkc.sh $KEYCHAIN_PWD

if [ $? -eq 0 ]; then
  echo "Checking for updates"
  if [ $(git status -uno | grep -q "Your branch is up to date") ] ||
  [ ! -d build ]; then
    echo "Fetching updates and rebuilding"
    git pull && \
    npm run build && \
    pushd build && \
    npm i --prod-only && \
    popd
  fi

  echo "Starting Agent"
  npm start
fi

exit 0
