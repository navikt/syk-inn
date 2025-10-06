FROM gcr.io/distroless/nodejs22-debian12@sha256:e4dfc93ed73008ab531d6b674bfe0e45f9c1c224914668685d998f873e00a8d2

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
