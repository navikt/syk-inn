FROM gcr.io/distroless/nodejs20-debian12@sha256:6ce9152d6987b3adb5e90793ca4950478d18bff21ebd881a3844bb97c839df74

WORKDIR /app

COPY next-logger.config.mjs /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
