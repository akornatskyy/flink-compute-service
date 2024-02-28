#!/usr/bin/env sh
set -o errexit

: "${FLINK_VERSION:=1.17.2}"
: "${SCALA_VERSION:=2.12}"
: "${FLINK_HOME:=/opt/flink}"

main() {
  if [ "${DEBUG}" = "1" ]; then
    set -o xtrace
  fi

  __download
  __install
  __add_user
  __test
  __clean
}

__download() {
  wget -q -c -O flink.tgz \
    https://dlcdn.apache.org/flink/flink-${FLINK_VERSION}/flink-${FLINK_VERSION}-bin-scala_${SCALA_VERSION}.tgz
}

__install() {
  mkdir -p ${FLINK_HOME}
  tar Cxzf ${FLINK_HOME} flink.tgz --strip-components=1
}

__add_user() {
  groupadd --system flink
  useradd --system --home-dir ${FLINK_HOME} --gid=flink flink
  chown -R root:root ${FLINK_HOME}
  chown -R flink:flink ${FLINK_HOME}/log
}

__test() {
  sudo -u flink ${FLINK_HOME}/bin/flink --version
}

__clean() {
  rm flink.tgz
  rm -rf ${FLINK_HOME}/log/*.log
}

main "$@"
