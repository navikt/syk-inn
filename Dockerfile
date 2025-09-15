FROM gcr.io/distroless/nodejs22-debian12@sha256:826bb2efc9f44adbf2cf77b49bcd9be01c3abe3c217cc75d5fc5ac8ee7de267a

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
