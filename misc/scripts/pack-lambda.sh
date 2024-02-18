#!/usr/bin/env sh
set -o errexit

: "${TMP:=/tmp}"
ARTIFACTS_DIR=${TMP}/.fcs-pack-lambda

main() {
  if [ "${DEBUG}" = "1" ]; then
    set -o xtrace
  fi

  if [ "${1}" = "" ]; then
    __usage
    exit 1
  fi

  ($1)
}

layer() {
  __prepare
  __npm_pack
  __npm_install
  __clean_extra
  __prepare_layer_zip
}

lambda() {
  __prepare
  __npm_pack
  __npm_install
  __clean_extra
  __prepare_lambda_zip
}

__usage() {
  echo "Usage: ${0} layer | lambda"
}

__prepare() {
  VERSION=$(git describe --tags --dirty --always)
  mkdir -p ${ARTIFACTS_DIR}
}

__npm_pack() {
  npm --silent pack --pack-destination ${ARTIFACTS_DIR} > /dev/null
}

__npm_install() {
  pushd ${ARTIFACTS_DIR} > /dev/null
  npm i --silent --no-progress --omit=dev --omit=optional --no-audit \
    --no-fund --no-update-notifier flink-compute-service-*.tgz
}

__clean_extra() {
  rm package.json flink-compute-service-*.tgz
  /bin/find . -type d \( -name '*bin' -o -name '.github' \) \
    -prune -exec rm -rf {} \;
  /bin/find . \( -name 'package-lock.json' -o -name '.package-lock.json' \
    -o -name '*.md' -o -name '*.ts*' -o -name '*.map' -o -name 'tsconfig.json' \
    -o -name '.eslint*' \) -delete
}

__prepare_layer_zip() {
  mkdir nodejs
  mv node_modules nodejs

  7z a -tzip flink-compute-service-layer.zip nodejs > /dev/null
  rm -rf nodejs

  popd > /dev/null
  mv ${ARTIFACTS_DIR}/flink-compute-service-layer.zip .
  ls -lh ./flink-compute-service-layer.zip  | awk '{print $5 "  " $9}'
}

__prepare_lambda_zip() {
  cat <<EOF > index.mjs
// $(date -u)
// ${VERSION}
export {handler} from 'flink-compute-service/lambda';
EOF

  7z a -tzip flink-compute-service-lambda.zip \
    index.mjs node_modules > /dev/null
  rm -rf index.mjs node_modules

  popd > /dev/null
  mv ${ARTIFACTS_DIR}/flink-compute-service-lambda.zip .
  ls -lh ./flink-compute-service-lambda.zip  | awk '{print $5 "  " $9}'
}

main "$@"
