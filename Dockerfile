FROM gcr.io/distroless/nodejs24-debian13@sha256:7dddf4fb0e101fd065eb20a2befd1c467cf1cabaeaca3df85aa4431150f51dc9

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
