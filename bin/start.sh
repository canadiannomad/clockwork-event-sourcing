#!/bin/bash -e
DIR=$(dirname "$(readlink -f "$0")")
cd ${DIR}/..
DIR=$(pwd)
PATH=${DIR}/node_modules/.bin:${PATH}
export NODE_OPTIONS="--trace-warnings --max-old-space-size=$(${DIR}/bin/free.sh | awk '{print int($1*0.8)}')"
node built/init.js

