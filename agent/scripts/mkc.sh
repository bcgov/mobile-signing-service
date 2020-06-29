#!/bin/bash

KC_NAME=cicd.keychain
CERT_PATH=/Users/xcode/certificates.p12

echo "Keychain Starting"

# check if target keychain exists:
/usr/bin/security list-keychains -d user | grep $KC_NAME &> /dev/null
rv=$?

if [[ $rv == 0 ]]; then
  # unlock keychain as it's always locked after reboot:
  echo "Unlocking keychain"
  /usr/bin/security unlock-keychain -p $1 $KC_NAME
  /usr/bin/security show-keychain-info $KC_NAME
else
  echo "Building keychian"
  /usr/bin/security create-keychain -p $1 $KC_NAME
  /usr/bin/security unlock-keychain -p $1 $KC_NAME
  /usr/bin/security list-keychains -d user -s $KC_NAME
  /usr/bin/security import $CERT_PATH -k $KC_NAME -P $1 -T /usr/bin/codesign
  /usr/bin/security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $1 $KC_NAME
  /usr/bin/security set-keychain-settings $KC_NAME
fi

echo "Keychain Finished"

exit 0
