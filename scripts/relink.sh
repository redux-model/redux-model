#!/usr/bin/env bash

set -ex

if [ $(uname) == 'Darwin' ]
then
  alias replace="sed -i ''"
else
  alias replace="sed -i"
fi

# lerna link @redux-model/core by configuration `publishConfig.directory`.
# The value is `packages/core/build` which is not real folder unfortunately.
# What we expected folder is `packages/core`, so we should fix it by hand.
rm -rf $PWD/node_modules/@redux-model/core
ln -s $(dirname $PWD)/core $PWD/node_modules/@redux-model/core
