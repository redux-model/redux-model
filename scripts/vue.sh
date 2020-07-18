#!/usr/bin/env bash

set -e

# vue redefine JSX which incompatible with react JSX
file=packages/vue/node_modules/@vue/runtime-dom/dist/runtime-dom.d.ts

# Don't use alias due to unbuntu (CI) can't recognize.
if [ $(uname) == 'Darwin' ]
then
  sed -i '' 's/JSX/_VUE_/' $file
else
  sed -i 's/JSX/_VUE_/' $file
fi
