#!/bin/sh
base_dir=$PWD
packages=$(find ./client/packages/ -maxdepth 1 -mindepth 1 -type d -printf "%f\n")

build() {
  echo "\e[1;35m >>> build components ... \e[0m"
  cd ./client

  for package in $packages
  do
    lerna run --stream --scope $package build && npm run lang 
  done

  cd $base_dir
  echo "\e[1;35m finish build <<< \e[0m"
}

upload(){
  echo "\e[1;33m >>> upload components ... \e[0m"

  for package in $packages
  do
    docker exec -it entrypoint_plugin_1 rm -r /var/www/imunify/$package/
    docker cp ./client/packages/$package/dist/esm/. entrypoint_plugin_1:/var/www/imunify/$package/
  done

  docker cp ./client/i18n entrypoint_plugin_1:/var/www/imunify/

  echo "\e[1;33m finish upload <<< \e[0m"
}

case $1 in 
  -h | --help ) echo "use param -b or --build for build components after upload to docker";;
  -b | --build ) build && upload ;;
  * ) upload;;
esac