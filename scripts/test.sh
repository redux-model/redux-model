#!/usr/bin/env bash

set -e

export TEST_PLATFORM=${1:-$TEST_PLATFORM}

rm -rf src/libs
cp -r src/$TEST_PLATFORM src/libs
yarn jest

sh scripts/create-symbol.sh
