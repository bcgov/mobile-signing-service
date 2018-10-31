#!/bin/bash

source .env
./scripts/mkc.sh $KEYCHAIN_PWD

if [ $? -eq 0 ]; then
  echo "Building and Starting Agent"
  npm run build && \
  npm start
fi

exit 0
