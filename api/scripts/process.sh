#!/bin/bash

SRC="uploads/1f105fe3d6a937028056f545c83e13c0"
DES="work/$(uuidgen)"
DELIVERY_FILE_NAME='mango'
echo $SRC
echo $DES

mkdir -p $DES
unzip -q $SRC -d $DES

pushd $DES

tozip=""
for i in $(find . -iname '*.xcarchive' | cut -c 3-); do
    echo "> Processing $i"
    tozip="$tozip ${i%.xcarchive*}"
    xcodebuild -exportArchive -archivePath $i -exportPath ${i%.xcarchive*} -exportOptionsPlist options.plist
done

echo "zip $DELIVERY_FILE_NAME $tozip"

zip $DELIVERY_FILE_NAME $tozip
