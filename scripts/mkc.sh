#!/bin/bash

KC_NAME=cicd
CERT_PATH=/Users/xcode/certificates.p12

echo "Keychain Starting"

# Code 0 = Ok
# Code 1 = Locked
# Code 36 = Locked
# Code 50 = Not Found
/usr/bin/security show-keychain-info $KC_NAME.keychain

if [ $? -eq 0 ]; then
  /usr/bin/security list-keychains -d user -s $KC_NAME.keychain
  echo "Keychain ready"
elif [ $? -eq 50 ]; then
  echo "Building keychian"
  /usr/bin/security create-keychain -p $1 $KC_NAME.keychain
  /usr/bin/security unlock-keychain -p $1 $KC_NAME.keychain
  /usr/bin/security list-keychains -d user -s $KC_NAME.keychain
  /usr/bin/security import $CERT_PATH -k $KC_NAME.keychain -P $1 -T /usr/bin/codesign
  /usr/bin/security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $1 $KC_NAME.keychain
  /usr/bin/security set-keychain-settings $KC_NAME.keychain
elif [ $? -eq 1 ]; then
  echo "Unlocking keychain"
  /usr/bin/security unlock-keychain -p $1 cicd.keychain
  /usr/bin/security show-keychain-info $KC_NAME.keychain
else
  echo "Unable to process keychain, error = $?"
  exit 1
fi

echo "Keychain Finished"

exit 0
