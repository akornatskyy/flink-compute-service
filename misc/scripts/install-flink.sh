#!/usr/bin/env sh
set -o errexit

: "${FLINK_VERSION:=1.17.2}"
: "${SCALA_VERSION:=2.12}"

main() {
  if [ "${DEBUG}" = "1" ]; then
    set -o xtrace
  fi

  __download
  __install
  __test
  __clean
}

__download() {
  wget -q -c -O flink.tgz \
    https://dlcdn.apache.org/flink/flink-${FLINK_VERSION}/flink-${FLINK_VERSION}-bin-scala_${SCALA_VERSION}.tgz
}

__install() {
  mkdir -p /opt/flink
  tar Cxzf /opt/flink flink.tgz --strip-components=1
}

__test() {
  /opt/flink/bin/flink --version
}

__clean() {
  rm flink.tgz
  rm -rf /opt/flink/log/*.log
}

main "$@"
