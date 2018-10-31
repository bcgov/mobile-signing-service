#!/bin/bash

[[ ! -f .env ]] \
  && echo "WARNING: Environment source not found."

source .env

[[ -z "$KEYCHAIN_PWD" ]] \
  && echo "ERROR: Missing keychain password." && exit 1

./scripts/mkc.sh $KEYCHAIN_PWD

if [ $? -eq 0 ]; then
  echo "Building and Starting Agent"
  npm run build && \
  npm start
fi

exit 0
