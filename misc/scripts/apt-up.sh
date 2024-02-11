#!/usr/bin/env sh
set -o errexit

main() {
  if [ "${DEBUG}" = "1" ]; then
    set -o xtrace
  fi

  __configure
  __update
  __upgrade
}

__configure() {
  echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
  cat <<EOF > /etc/apt/apt.conf.d/10recommends
APT::Install-Recommends "0";
APT::Install-Suggests "0";
EOF
}

__update() {
  rm -rf /var/lib/apt/lists/*
  apt-get -yq update
}

__upgrade() {
  apt-get -yq upgrade
}

main "$@"
