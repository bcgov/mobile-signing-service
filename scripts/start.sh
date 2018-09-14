#!/bin/bash

source .env
./scripts/mkc.sh $KEYCHAIN_PWD

if [ $? -eq 0 ]; then
  echo "Starting agent"
  npm run dev
fi

exit 0
