FROM gcr.io/distroless/nodejs24-debian13@sha256:f2d4862c952f2bfee7117f1b74e4990fff94532ba1eb2f2670a5ec39f9f04295

WORKDIR /app

# Next.js app
COPY next-logger.config.cjs /app/
COPY .next/standalone /app/

# Typst + static typst files
COPY typst-pdf /app/typst-pdf

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
