FROM gcr.io/distroless/nodejs22-debian12@sha256:20faf7f34237c2546646225ec439c7241351475583d7ef030997983e527ac73a

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
