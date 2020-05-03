#!/bin/bash

projects=(spring-data-examples geohash-example pairwise-comparison letsencrypt-docker-compose)

for project in ${projects[@]}; do
  echo "Building $project"
  rm -rf "$project"
  echo "Downloading $project GitHub repository"
  curl "https://github.com/evgeniy-khist/${project}/archive/master.zip" -o "${project}.zip" -L
  unzip -q "${project}.zip"
  rm "${project}.zip"
  mv "${project}-master" "$project"
done

rm -f "index.html"

echo "Building the HTML pages"
node build.js "${projects[@]}"
  
for project in ${projects[@]}; do
  echo "Cleaning up $project"
  rm -rf "${project}/src"
  find "${project}/" -type f ! -name '*.html' -and ! -name '*.js' -and ! -name '*.css' -and ! -name '*.jpg' -and ! -name '*.jpeg' -and ! -name '*.png' -and ! -name '*.gif' -delete
  find "${project}/" -type d -empty -delete
done
