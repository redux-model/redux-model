#!/usr/bin/env bash

set -e

rm -rf src/libs
cp -r src/react-native src/libs
export TEST_PLATFORM=rn && yarn jest

#rm -rf src/libs
#cp -r src/taro src/libs
#export TEST_PLATFORM=taro && yarn jest

rm -rf src/libs
cp -r src/web src/libs
export TEST_PLATFORM=web && yarn jest

sh scripts/create-symbol.sh
