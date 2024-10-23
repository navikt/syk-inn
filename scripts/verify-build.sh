#!/bin/bash

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
  # Show yellow warning
  echo -e "\e[33mWarning: .env.production does not exist.\e[0m"

  # Prompt the user for y/N (default N)
  read -p "Do you want to copy nais/envs/.env.dev to .env.production? (y/N): " response
  response=${response:-N}

  # Check user response
  if [[ "$response" == "y" || "$response" == "Y" ]]; then
    cp nais/envs/.env.dev .env.production
    echo ".env.production has been created."
  else
    echo "Operation cancelled. Exiting."
    exit 1
  fi
else
  echo ".env.production already exists. It's all good in the hood..."
fi
