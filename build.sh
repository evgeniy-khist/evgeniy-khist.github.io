#!/bin/bash

if [ $# -eq 0 ]; then
  projects=(spring-data-examples postgresql-performance-essentials geohash-example pairwise-comparison letsencrypt-docker-compose)
else
  projects=($*)
fi

for project in ${projects[@]}; do
  echo "Building $project"
  rm -rf "$project"

  branches=(main master)

  for branch in ${branches[@]}; do
    echo "Downloading $project GitHub repository (${branch} branch)"
    curl "https://github.com/evgeniy-khist/${project}/archive/${branch}.zip" -o "${project}.zip" -L --fail
    if [ $? -eq 0 ]; then
      break
    fi
  done

  unzip -q "${project}.zip"
  rm "${project}.zip"

  mv ${project}-* "$project"
  
  echo
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
