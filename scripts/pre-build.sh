#!/usr/bin/env bash

if [ ! -f ".env.production" ]; then
  if [ -n "$CI" ]; then
    printf "CI environment detected and .env.production is missing. Is the common workflow not working as intended?"
    exit 1
  fi

  printf "\e[33mWarning: .env.production does not exist. This is required to build the application locally.\e[0m"

  printf "\e[34m\n  Do you want to copy nais/envs/.env.dev to .env.production? (y/N):\n \e[0m"
  read -r response


  if [[ "$response" == "y" || "$response" == "Y" ]]; then
    cp .nais/envs/.env.dev .env.production
    runtimeEnv=$(grep "^NEXT_PUBLIC_RUNTIME_ENV=" .env.production | cut -d '=' -f2)
    printf "\e[32m  👍 .env.production has been created. Building application as \e[44;97m $runtimeEnv \e[32m\e[0m"
  else
    printf "\e[33mOperation cancelled. Exiting.\e[0m"
    exit 1
  fi
else
  runtimeEnv=${NEXT_PUBLIC_RUNTIME_ENV:-$(grep "^NEXT_PUBLIC_RUNTIME_ENV=" .env.production | cut -d '=' -f2)}
  printf "\e[32m  👍 .env.production already exists. It's all good in the hood... Building application as \e[44;97m $runtimeEnv \e[32m\e[0m\n"
fi
