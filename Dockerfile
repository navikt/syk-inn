FROM gcr.io/distroless/nodejs24-debian12@sha256:55f91540ad9b01203b2bf7248f95a3113cf51a14ccc84441f07a6ed052b30e05

WORKDIR /app

COPY next-logger.config.cjs /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
