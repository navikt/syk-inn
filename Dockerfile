FROM gcr.io/distroless/nodejs22-debian12@sha256:dfc74b29486c7f75b32b7c97acf078cfce6665336fb2f08e0946ec77042b5fe3

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
