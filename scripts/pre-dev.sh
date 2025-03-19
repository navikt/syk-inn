#!/usr/bin/env sh

set -e  # Exit immediately if any command fails

if grep -q "NEXT_PUBLIC_RUNTIME_ENV=local" .env.development; then
    if ! nc -z localhost 6379; then
        if [ "$(docker ps -aq -f name=syk-inn-dev-valkey)" ]; then
            printf "\e[34m  👀 Found existing stopped docker valkey container, starting it... \e[32m\e[0m\n\n"
            docker start syk-inn-dev-valkey >> /dev/null || { printf "\e[31m 🔥🔥🔥 Failed to start Valkey container\n"; exit 1; }
            exit 0
        else
            printf "\e[33m  😲 No valkey image found! Starting valkey container... \e[32m\e[0m\n\n"
            yarn dev:valkey >> /dev/null || { printf "\e[31m 🔥🔥🔥 Failed to start Valkey via Yarn\n"; exit 1; }
            exit 0
        fi
    fi

    printf "\e[32m  👍 Valkey available. Starting dev server ... \e[32m\e[0m\n\n"
fi
