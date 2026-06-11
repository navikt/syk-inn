FROM gcr.io/distroless/nodejs24-debian13@sha256:10e262383ceb3a2a5f6f5ceaca5ecebe74951eff21868a055589676eec3a8001

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
