#!/usr/bin/env sh
set -o errexit

main() {
  if [ "${DEBUG}" = "1" ]; then
    set -o xtrace
  fi

  __prepare
  __install
  __test
  __clean
}

__prepare() {
  ARCH=$(dpkg --print-architecture)
  wget -q -c https://amazoncloudwatch-agent.s3.amazonaws.com/debian/${ARCH}/latest/amazon-cloudwatch-agent.deb
}

__install() {
  dpkg -i ./amazon-cloudwatch-agent.deb
}

__test() {
  /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent -version
}

__clean() {
  rm -rf ./amazon-cloudwatch-agent.deb
}

main "$@"
