FROM gcr.io/distroless/nodejs22-debian12@sha256:de5f1ba6961913790b8c5318732e5eed037e1dc042b3b212da06c76ac55b6438

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
