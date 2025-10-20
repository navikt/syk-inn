FROM gcr.io/distroless/nodejs24-debian12@sha256:78513aa8d905a46b78d7ac3406389d17bf83f21b1e74078cb63e4c3ccf9f5ca3

WORKDIR /app

COPY next-logger.config.cjs /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
