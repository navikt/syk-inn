#!/usr/bin/env sh

if grep -q "NEXT_PUBLIC_RUNTIME_ENV=local" .env.development; then
    if ! nc -z localhost 6379; then
        if [ "$(docker ps -aq -f name=syk-inn-dev-redis)" ]; then
            printf "\e[34m  👀 Found existing stopped docker redis container, starting it... \e[32m\e[0m\n\n"
            docker start syk-inn-dev-redis >> /dev/null
            exit 0
        else
            printf "\e[33m  😲 No redis image found! Starting redis container... \e[32m\e[0m\n\n"
            yarn dev:redis >> /dev/null
            exit 0
        fi
    fi

    printf "\e[32m  👍 Redis available. Starting dev server ... \e[32m\e[0m\n\n"
fi
