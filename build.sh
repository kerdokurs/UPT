#!/bin/bash

mkdir build

cp ./index.js ./build/index.js
cp ./views/ ./build/views/ -r
mkdir ./build/environment/
cp ./environment/creds.json ./build/environment/creds.json
cp ./core/ ./build/core/ -r
cp ./package.json ./build/package.json
cp ./data/ ./build/data/ -r
cp ./static/ ./build/static/ -r
cp ./environment/.env ./build/.env
