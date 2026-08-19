FROM gcr.io/distroless/nodejs24-debian13@sha256:2bf219fb146cb474aae1ef2b446f8e61fb6aa47b55d067fd05cae39ec348acc2

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
