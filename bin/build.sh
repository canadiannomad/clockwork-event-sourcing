#!/bin/bash -e

if [ -f "built" ] ; then
    rm -R built/*
fi

DIR=$(dirname "$(readlink -f "$0")")
cd ${DIR}/..
DIR=$(pwd)
PATH=${DIR}/node_modules/.bin:${PATH}
cd ${DIR}/src

export NODE_OPTIONS="--max-old-space-size=$(${DIR}/bin/free.sh | awk '{print int($1*0.9)}')"
unset NODE_OPTIONS
time tsc && echo "Build Complete"
