FROM gcr.io/distroless/nodejs24-debian12@sha256:056a45d3ba58057ca4f39036f8350216260d347b72082540f049cef5fe1d9c0a

WORKDIR /app

COPY next-logger.config.cjs /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
