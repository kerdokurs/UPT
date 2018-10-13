#!/bin/bash

cd build
scp -i ../environment/key.pem -r ./ ubuntu@"$1":~/upt-www/
cd ../

rm -rf ./build/
