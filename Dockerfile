FROM gcr.io/distroless/nodejs22-debian12@sha256:ce215c7aca8708c4a748b351272d2722289f940d7626e86ad6da877008fd03d6

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
