#!/bin/bash

KC_NAME=cicd.keychain
CERT_PATH=/Users/xcode/certificates.p12

echo "Keychain Starting"

# Code 0 = Ok
# Code 1 = Locked
# Code 36 = Locked
# Code 50 = Not Found
/usr/bin/security show-keychain-info $KC_NAME 2>/dev/null
rv=$?

if [ $rv -eq 0 ]; then
  /usr/bin/security list-keychains -d user -s $KC_NAME
  echo "Keychain ready"
elif [ $rv -eq 50 ]; then
  echo "Building keychian"
  /usr/bin/security create-keychain -p $1 $KC_NAME
  /usr/bin/security unlock-keychain -p $1 $KC_NAME
  /usr/bin/security list-keychains -d user -s $KC_NAME
  /usr/bin/security import $CERT_PATH -k $KC_NAME -P $1 -T /usr/bin/codesign
  /usr/bin/security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $1 $KC_NAME
  /usr/bin/security set-keychain-settings $KC_NAME
elif [ $rv -eq 1 ] || [ $rv -eq 36 ] ; then
  echo "Unlocking keychain"
  /usr/bin/security unlock-keychain -p $1 $KC_NAME
  /usr/bin/security show-keychain-info $KC_NAME
else
  echo "Unable to process keychain, error = $rv"
  exit 1
fi

echo "Keychain Finished"

exit 0
