#!/bin/bash

set -e

if [ -z "$NPM_URI" ]
then
  NPM_URI="npm.pkg.github.com"
fi

if [ -z "$NPM_AUTH_TOKEN" ]
then
  echo "NPM_AUTH_TOKEN is required to continue. Abort."
  exit 1;
fi

if [ -z "$BASE_URL" ]
then
  echo "BASE_URL is required to continue. Abort."
  exit 1;
fi

NPMRC_TEMP=$(cat .npmrc)

rollback-npmrc() {
  echo -e "$NPMRC_TEMP" > .npmrc
}

trap "rollback-npmrc" EXIT SIGINT

sed -e "s/\$NPM_URI/$NPM_URI/" \
    -e "s/\$NPM_AUTH_TOKEN/$NPM_AUTH_TOKEN/" ./ci/npmrc-template > .npmrc

yarn install --frozen-lockfile

if [ $WITH_TEST == true ]
then
  echo "*** run tests ***"
  yarn coverage
fi

if [ $WITH_LINT == true ]
then
  echo "*** run lint ***"
  yarn lint
fi

yarn build
