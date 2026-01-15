FROM gcr.io/distroless/nodejs24-debian12@sha256:b9de5fbe1d3f745a1902600dde9fd91600cd784316e20c759a06894368ccd9c2

WORKDIR /app

COPY next-logger.config.cjs /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
