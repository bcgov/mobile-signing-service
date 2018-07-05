#!/bin/bash

KC_NAME=cicd

security create-keychain -p $1 $KC_NAME.keychain
security import ~/Desktop/Certificates.p12 -k $KC_NAME.keychain -P $2 -T /usr/bin/codesign
security list-keychains -d user -s $KC_NAME.keychain
security unlock-keychain -p $1 $KC_NAME.keychain
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $1 $KC_NAME.keychain
security set-keychain-settings $KC_NAME.keychain 
