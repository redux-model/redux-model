#!/usr/bin/env bash

set -e

rm -rf ./build/*
tsc
mv ./build/src ./build/libs
cp ../../README.md ../../LICENSE ./package.json ./build

./node_modules/.bin/public-refactor --src ./src --dist ./build/libs
