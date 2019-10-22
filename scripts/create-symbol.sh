#!/usr/bin/env bash

set -e

mkdir -p src/libs
dir=${1:-web}

rm -rf src/libs/*
ln -sf $PWD/src/$dir/* $PWD/src/libs
