#!/usr/bin/env bash

set -e

package_name=vue

sh ./scripts/create-symbol.sh $package_name
rm -rf ./build
node_modules/.bin/tsc


for definitionFile in $(find ./src -name *.d.ts)
do
  cp -f ${definitionFile} ./build/${definitionFile}
done


mv ./build/src/* ./build/

for dirName in $(ls ./build)
do
  [ "$dirName" != ${package_name} -a  "$dirName" != "core" ] && rm -rf ./build/${dirName}
done

mv ./build/${package_name} ./build/libs

cp README.md LICENSE ./build
cp package-list/${package_name}.json ./build/package.json

old_registry=$(npm config get registry)
npm config set registry https://registry.npmjs.org
set +e
whoami=$(npm whoami 2>/dev/null)
set -e

if [ -z "$whoami" ]
then
   echo "login plz..."
   npm login
fi
echo "I am: $(npm whoami)"

sleep 1
echo "Begin publish..."
npm publish ./build/ --access=public "$@"

npm config set registry ${old_registry}

sleep 2

curl https://npm.taobao.org/sync/@redux-model/${package_name} >/dev/null
