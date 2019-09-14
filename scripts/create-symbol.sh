#!/usr/bin/env bash

set -ex

mkdir -p src/libs
dir=${1:-web}

ln -sf $PWD/src/$dir/types.ts $PWD/src/libs
ln -sf $PWD/src/$dir/dev.ts $PWD/src/libs
ln -sf $PWD/src/$dir/RequestAction.ts $PWD/src/libs
