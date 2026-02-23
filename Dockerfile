FROM gcr.io/distroless/nodejs24-debian12@sha256:ffd856f109228f43ed5cbbca5f07e19944e5569e9b9564f1064a0b52c40f3cb0

WORKDIR /app

COPY next-logger.config.cjs /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
