#!/bin/bash

set -e

if [ -z "$VEGA_REPOPREFIX" ]
then
  VEGA_REPOPREFIX="vega-rb-result"
fi

if [ -z "$IMAGE_NAME" ]
then
  IMAGE_NAME="frontend-builder"
fi

if [ -z "$FE_BUILDER_VERSION" ]
then
  FE_BUILDER_VERSION="1"
fi

TAG="$VEGA_REPOPREFIX/$IMAGE_NAME:$FE_BUILDER_VERSION"
NAME="$VEGA_REPOPREFIX.$IMAGE_NAME"

CACHE_PATH="/home/vega/vega-builder-automation/cache"

mkdir -p /home/vega/vega-builder-automation/cache

if [[ -z "$REBUILD" ]];
then
  echo "Docker image build."
  docker build -t $TAG ./ci
else
  echo "Docker image force rebuild."
  docker build -t $TAG --no-cache ./ci
fi

docker 2>/dev/null 1>&2 rm $NAME || true

docker run \
  --name "$NAME" \
  -v "$(pwd):/app" \
  --env NPM_URI=$NPM_URI \
  --env NPM_AUTH_TOKEN=$NPM_AUTH_TOKEN \
  --env BASE_URL=$BASE_URL \
  --env BASE_API_URL=$BASE_API_URL \
  --env WITH_TEST=false \
  --env WITH_LINT=false \
  -v $CACHE_PATH:/usr/local/share/.cache/ \
  $TAG \
  /app/ci/build-entrypoint.sh
