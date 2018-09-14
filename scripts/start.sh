#!/bin/bash

source .env
/usr/bin/security unlock-keychain -p $KEYCHAIN_PWD cicd.keychain

npm run dev
