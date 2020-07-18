#!/usr/bin/env bash

set -ex

if [ $(uname) == 'Darwin' ]
then
  alias replace="sed -i ''"
else
  alias replace="sed -i"
fi

# vue redefine JSX which incompatible with react JSX
replace 's/JSX/_VUE_/' packages/vue/node_modules/@vue/runtime-dom/dist/runtime-dom.d.ts
