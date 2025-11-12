FROM gcr.io/distroless/nodejs24-debian12@sha256:2606f54df9588be6e389b824fcd3937408b3b7b802930bb35bb6422e07caf228

WORKDIR /app

COPY next-logger.config.cjs /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
