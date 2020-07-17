#!/usr/bin/env bash

set -e

if [ $(uname) == 'Darwin' ]
then
  alias replace="sed -i ''"
else
  alias replace="sed -i"
fi


rm -rf ./build/*
../../node_modules/.bin/tsc
mv ./build/src ./build/lib
cp ../../README.md ../../LICENSE ./package.json ./build

../../node_modules/.bin/public-refactor --src ./src --dist ./build/lib

# packages/core
replace 's@\("main": \)"src/index\.ts"@\1"lib/index.js"@' ./build/package.json
replace 's@\("types": \)"src/index\.ts"@\1"lib/index.d.ts"@' ./build/package.json
replace 's@\("directory": \)"\."@\1"build"@' ./build/package.json
