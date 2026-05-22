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

# Load secret dari .env.production secara aman
set -a
source .env.production
set +a

aws lambda update-function-configuration \
  --function-name "$FUNCTION" \
  --environment "Variables={
    DATABASE_URL=$DATABASE_URL,
    JWT_SECRET=$JWT_SECRET,
    NODE_ENV=production,
    FRONTEND_URL=https://www.ppwl-a3.my.id,
    API_SECRET_KEY=$API_SECRET_KEY,
    CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET,
    PRISMA_QUERY_ENGINE_LIBRARY=/var/task/libquery_engine-rhel-openssl-3.0.x.so.node
  }" \
  --query "LastUpdateStatus" \
  --output text

echo "✅ Deploy selesai! Test dengan:"
echo "curl https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws/health"
echo "curl https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws/posts"
