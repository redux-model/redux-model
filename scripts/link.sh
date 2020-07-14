#!/usr/bin/env bash

if [ ! -L 'src/core' ] || [ ! -d 'src/core' ]
then
  rm -rf src/core
  ln -s $(dirname $PWD)/../src src/core
fi
