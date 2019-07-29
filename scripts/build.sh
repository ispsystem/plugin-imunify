#!/bin/sh
build_folder="build"
base_dir=$PWD

build_plugin () {
  rm -rf ./$build_folder && mkdir ./$build_folder
  # >>>> copy server files <<<<
  echo "\e[1;34m >> start build server"
  echo " copy server files"
  cp -R ./server/. ./$build_folder/ & cp ./meta.json ./$build_folder/
  echo " finish build server << \n \e[0m"

  # >>>> build and copy client files <<<<
  echo "\e[1;35m >> start build client"
  cd ./client

  lerna bootstrap

  for package in $(find ./packages/ -maxdepth 1 -mindepth 1 -type d -printf "%f\n") 
  do
    if [ $package != "node_modules" ]; then
      lerna run --stream --scope $package build && npm run lang 
      cp -R ./packages/$package/dist/esm/. ../$build_folder/$package
      echo "export * from \"./$package/index.mjs"\" > ../$build_folder/$package".js"
    fi
  done

  echo "\e[1;35m copy translate ... \e[0m"
  cp -R ./i18n ../$build_folder/ 
  echo "\e[1;35m finish build client << \n \e[0m"

  cd $base_dir
}

archive() {
  # >>>> archiving build folder <<<<
  echo "\e[1;33m >>> archiving plugin ... \e[0m"
  (cd $build_folder && zip plugin -r * )
  echo "\e[1;33m finish archiving <<< \e[0m"
}

copy_to_docker() {
  docker cp build/. entrypoint_plugin_1:/var/www/imunify/
}

case $1 in 
  -h | --help ) echo "use param -c or --copy for copy build files in docker container \nuse param -z or --zip for archiving source code";;
  -c | --copy ) build_plugin && copy_to_docker ;;
  -z | --zip ) build_plugin && archive ;;
  * ) build_plugin;;
esac


