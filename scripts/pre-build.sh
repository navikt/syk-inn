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

# Verify that typst binary is correctly loaded, i.e. its available in ./typst-pdf/typst
if ! command -v ./typst-pdf/typst &> /dev/null; then
  printf "\e[31mError: typst binary not found in ./typst-pdf/typst. Please ensure it is correctly loaded.\e[0m\n"

  ls -al ./typst-pdf

  exit 1
else
  # Verify that typst binary is the same as one defined in .mise.toml
  typstVersion=$(./typst-pdf/typst --version | awk '{print $2}')
  miseTypstVersion=$(grep "^typst" .mise.toml | cut -d '"' -f2)

  if [ "$typstVersion" != "$miseTypstVersion" ]; then
    printf "\e[31mError: typst binary version ($typstVersion) does not match the version defined in .mise.toml ($miseTypstVersion). Please ensure they are the same.\e[0m\n"
    exit 1
  fi

  printf "\e[32m  👍 typst binary ($typstVersion/$miseTypstVersion) found in ./typst-pdf/typst. All good!\e[0m\n"
fi
