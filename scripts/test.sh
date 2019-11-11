#!/usr/bin/env bash

set -e

function test() {
    rm -rf src/libs
    cp -r src/$1 src/libs
    export TEST_PLATFORM=$1 && yarn jest
}

test vue
test react-native
test taro
test web

sh scripts/create-symbol.sh
