#!/bin/bash

[[ ! -f x ]] \
  && echo "WARNING: Environment source not found."

source .env

[[ -z "$KEYCHAIN_PWD" ]] \
  && echo "ERROR: Missing keychain password." && exit 1

./scripts/mkc.sh $KEYCHAIN_PWD

if [ $? -eq 0 ]; then
  echo "Building and Starting Agent"
  npm run build && \
  pushd build && \
  npm i --prod-only && \
  npm start
fi

exit 0
