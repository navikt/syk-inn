FROM gcr.io/distroless/nodejs22-debian12@sha256:7461aeaace21b36e65d1b56bf3eda84cd5d156d344ecf95702bf76e03d40d4ab

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/
COPY src/data-layer/graphql/schema/*.graphqls /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
