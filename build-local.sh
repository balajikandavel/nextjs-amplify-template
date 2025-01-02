#!/bin/bash
set -x  # Enable command tracing

echo "=== Environment Info ==="
yarn --version
node --version
pwd
ls -la

echo "=== Pre-Build Phase ==="
yarn install --frozen-lockfile
yarn add encoding
yarn list typescript @types/node
ls -la node_modules/.bin/tsc || true

echo "=== Build Phase ==="
yarn build || { echo "Build failed with:"; cat .next/error.log; exit 1; }

echo "=== Post-Build Phase ==="
mkdir -p .next/standalone/.next/static
cp -r .next/static/* .next/standalone/.next/static/ || true
cp -r public/* .next/standalone/public/ || true
cp package.json .next/standalone/
cd .next/standalone
yarn install --production --ignore-scripts

echo "=== Build Complete ===" 