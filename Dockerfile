FROM gcr.io/distroless/nodejs24-debian12@sha256:98c1d2e0ebf042776341cb47b5eac60c7b970ec955e365ef2454f92875bf0320

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
