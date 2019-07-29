#!/bin/sh
build_folder="build"

# Method for build plugin
build() {

  # Delete build folder
  rm -rf ./$build_folder && mkdir ./$build_folder

  # Build and copy client files
  (cd ./client && npm run build)

  # Copy server files
  cp -R ./server/. ./$build_folder/ & cp ./meta.json ./$build_folder/

}

# Method for archiving build folder
archive() {
  (cd $build_folder && zip plugin -r * )
}

case $1 in 
  -h | --help ) echo "This is the imunify plugin build script \n  use params: \n  -z | --zip \t - for archiving source code";;
  -z | --zip ) build && archive ;;
  * ) build;;
esac


