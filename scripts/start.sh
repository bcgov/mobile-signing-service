#!/bin/bash

[[ ! -f x ]] \
  && echo "WARNING: Environment source not found."

source .env

[[ -z "$KEYCHAIN_PWD" ]] \
  && echo "ERROR: Missing keychain password." && exit 1

./scripts/mkc.sh $KEYCHAIN_PWD

sleep 5

if [ $? -eq 0 ]; then
  echo "Checking for updates"
  if [ $(git status -uno | grep -q "Your branch is up to date") ] || [ ! -d ../build ]; then
    echo "Clean up build folder and previously installed dependencies..."
    rm -rf build/ node_modules/
    echo "Fetching updates and rebuilding"
    git pull && \
    npm i && \
    npm run build 
  fi

  echo "Starting Agent"
  npm start
fi

exit 0
