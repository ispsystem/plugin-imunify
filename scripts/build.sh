#!/bin/sh
rm -rf ./$1 && mkdir ./$1
for package in $(find ./packages/ -maxdepth 1 -mindepth 1 -type d -printf "%f\n") 
do
  lerna run --stream --scope $package build && npm run lang
  cp -R ./packages/$package/dist/esm/. ./$1/$package
  echo "export * from \"$package/index.mjs"\" > ./$1/$package".js"
done
cp -R ./i18n ./$1/ | true & cp ./meta.json ./$1/ | true