#!/bin/bash

# quick and dirty utility to just demonstrate how many messages are received on average from 
# a single request

main() {
  set -x
  local tmp_file=$(mktemp /tmp/$0.XXXXXX)
  local start=$(date +%s.%N)
  curl -s 'https://chat-interview-proxy-63u64o32qq-ez.a.run.app/?key=1ec1716d-3406-4bae-8a5a-e1d7c38c36ef' > $tmp_file
  local end=$(date +%s.%N)
  local msg_count=$(grep 'event: privmsg' $tmp_file | wc -l)
  rm -f $tmp_file
  local average_msgs_per_second=`bc -l <<< "$msg_count/($end-$start)"`

  set +x
  echo "Average messages per second received: ${average_msgs_per_second}"
}

main
