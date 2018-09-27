#!/usr/bin/bash

mkdir out
cp ./index.js ./out/index.js
cp ./views/ ./out/views/ -r
cp ./environment/ ./out/environment/ -r
cp ./core/ ./out/core/ -r
cp ./package.json ./out/package.json
cp ./data/ ./out/data/ -r
cp ./static/ ./out/static/ -r

cd out
scp -i ../environment/key.pem -r ./ ubuntu@"$1":~/upt-www/
cd ../

rm -rf ./out/
