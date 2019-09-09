#!/usr/bin/env bash

set -ex

mkdir -p src/libs

ln -sf $PWD/src/web/types.ts $PWD/src/libs
ln -sf $PWD/src/web/dev.ts $PWD/src/libs
ln -sf $PWD/src/web/RequestAction.ts $PWD/src/libs
