#!/usr/bin/env sh
set -o errexit

: "${JAVA_VERSION:=11}"

main() {
  if [ "${DEBUG}" = "1" ]; then
    set -o xtrace
  fi

  __prepare
  __install
  __clean
  __test
}

__prepare() {
  if [ ! -f /usr/share/keyrings/corretto-keyring.gpg ]; then
    apt-get install -y gpg
    wget -O - https://apt.corretto.aws/corretto.key | \
      gpg --dearmor -o /usr/share/keyrings/corretto-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/corretto-keyring.gpg] https://apt.corretto.aws stable main" | \
      tee /etc/apt/sources.list.d/corretto.list
  fi
}

__install() {
  apt-get update
  apt-get install -y java-${JAVA_VERSION}-amazon-corretto-jdk
}

__clean() {
  rm -rf /var/lib/apt
}

__test() {
  java -version
}

main "$@"
