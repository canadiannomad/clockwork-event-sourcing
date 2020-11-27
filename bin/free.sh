#!/bin/bash
if ! command -v free &> /dev/null
then
  # Running on Mac...
    vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576);' |awk '/free:/ || /inactive:/ {sum += int($2)} END {print sum}'
else
  # Running on Linux
  free -m |grep 'Mem:' | awk '{print $NF}'
fi
