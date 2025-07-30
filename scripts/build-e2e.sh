#!/usr/bin/env sh

echo -e "\033[0;32mBuilding app for e2e, making sure dev mode isn't running\033[0m"

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/internal/is_alive | grep 200 > /dev/null; then
  echo -e "\033[0;31mOh no, it's alive! Find your dev mode terminal and kill the app before trying to build for e2e\033[0m"
  exit 1
fi

echo -e "\033[0;32mLooks good, lets build!\033[0m"

cp .nais/envs/.env.demo .env.production
NEXT_PUBLIC_ASSET_PREFIX= NEXT_PUBLIC_BASE_PATH= NEXT_PUBLIC_RUNTIME_ENV=e2e yarn build
cp -R .next/static .next/standalone/.next

