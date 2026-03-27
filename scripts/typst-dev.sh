#!/usr/bin/env sh

# Verify that typst binary is the same as one defined in .mise.toml
typstVersion=$(./typst-pdf/typst --version | awk '{print $2}')
miseTypstVersion=$(grep "^typst" .mise.toml | cut -d '"' -f2)

if [ "$typstVersion" != "$miseTypstVersion" ]; then
  printf "\e[31mError: typst binary version ($typstVersion) does not match the version defined in .mise.toml ($miseTypstVersion). Run yarn init:pdf .\e[0m\n"
  exit 1
fi

DATA=$(cat ./typst-pdf/test-data/big.json)

printf "\e[32m  👍 Running typst watch! Open ./typst-pdf/sykmelding.pdf to view changes live!"

./typst-pdf/typst watch --open --pdf-standard=a-2a --font-path=./typst-pdf/fonts --input "sykmelding=$DATA" typst-pdf/sykmelding.typ
