#!/usr/bin/env sh

DATA=$(cat ./typst-pdf/test-data/big.json)

printf "\e[32m  👍 Running typst watch! Open ./typst-pdf/sykmelding.pdf to view changes live!"

./typst-pdf/typst watch --open --pdf-standard=a-2a --font-path=./typst-pdf/fonts --input "sykmelding=$DATA" typst-pdf/sykmelding.typ
