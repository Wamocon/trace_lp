#!/bin/bash
# script to collect static assets for deployment
set -e

# create dist directory
mkdir -p dist

# copy static files
# adding -f and -v to ensure overwrite and verbose
cp -v index.html dist/
cp -v agb.html dist/
cp -v cookies.html dist/
cp -v datenschutz.html dist/
cp -v impressum.html dist/
cp -v *.css dist/
cp -v *.js dist/
cp -v *.png dist/
cp -v *.svg dist/
cp -v .nojekyll dist/

# delete excluded files from dist if accidentally copied
rm -f dist/PRAESENTATION_SKRIPT.html
rm -f dist/intro.mp4

echo "Deployment preparation complete. Contents of dist/:"
ls -F dist/
