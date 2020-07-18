#!/usr/bin/env bash

set -ex

rm -rf $PWD/node_modules/@redux-model/core

ls $(dirname $PWD)/core

ln -s $(dirname $PWD)/core $PWD/node_modules/@redux-model/core
