#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run demo:build

# navigate into the build output directory
cd dist-demo

# place .nojekyll to bypass Jekyll processing
echo > .nojekyll

git init
git config user.name deploy
git config user.email \<\>
git checkout -B main
git add -A
git commit -m 'updated'
git push -f https://github.com/swimyoung/dom-find-and-replace.git main:gh-pages

cd -