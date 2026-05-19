#!/bin/bash
set -e

BINARY="node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node"
BUCKET="ppwl-instagram-fe-team-3"
FUNCTION="monorepo-backend"

echo "==> 1. Build Lambda bundle..."
bun run build:lambda

echo "==> 2. Menyiapkan folder deploy..."
rm -rf deploy && mkdir -p deploy
cp dist/lambda.js deploy/
cp "$BINARY" deploy/

echo "==> 3. Membuat ZIP..."
cd deploy
zip -j ../lambda-deploy.zip lambda.js libquery_engine-rhel-openssl-3.0.x.so.node
cd ..

echo "==> 4. Upload ke S3..."
aws s3 cp lambda-deploy.zip "s3://$BUCKET/lambda-deploy.zip"

echo "==> 5. Update Lambda code..."
aws lambda update-function-code \
  --function-name "$FUNCTION" \
  --s3-bucket "$BUCKET" \
  --s3-key lambda-deploy.zip \
  --query "LastUpdateStatus" \
  --output text

echo "==> 5b. Menunggu Lambda selesai update..."
aws lambda wait function-updated --function-name "$FUNCTION"

echo "==> 6. Set PRISMA_QUERY_ENGINE_LIBRARY env var..."
aws lambda update-function-configuration \
  --function-name "$FUNCTION" \
  --environment "Variables={
    DATABASE_URL=postgresql://neondb_owner:npg_NwQBemxV3gb4@ep-old-sunset-aqih8jj4-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require,
    JWT_SECRET=bTihGOa5jzSbgN4krIHgZX1vTdOVuyHsEhkZ4J1EQXF,
    NODE_ENV=production,
    FRONTEND_URL=*,
    PRISMA_QUERY_ENGINE_LIBRARY=/var/task/libquery_engine-rhel-openssl-3.0.x.so.node
  }" \
  --query "LastUpdateStatus" \
  --output text

echo "✅ Deploy selesai! Test dengan:"
echo "curl https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws/health"
echo "curl https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws/posts"
