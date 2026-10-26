FROM gcr.io/distroless/nodejs24-debian13@sha256:15ad6c1f53346336ebdd06b6752f8f92ecf2f1dff5948e8f99d6aac737eb26dd

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
