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
  apt-get install -y unzip

  ARCH=$(dpkg --print-architecture)
  case "$ARCH" in
  "amd64")
    ARCH="x86_64"
    ;;
  "arm64")
    ARCH="aarch64"
    ;;
  esac

  wget -q -c -O awscli.zip \
    https://awscli.amazonaws.com/awscli-exe-linux-${ARCH}.zip
  unzip -qo awscli.zip
}

__install() {
  ./aws/install --update
}

__test() {
  aws --version
}

__clean() {
  rm -rf aws awscli.zip
}

main "$@"
