FROM gcr.io/distroless/nodejs24-debian13@sha256:2b39d276e969e32d23e7266aeb6b493ba96f13f86860a91d6f895c4e99fee25b

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
