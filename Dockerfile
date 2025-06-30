FROM gcr.io/distroless/nodejs22-debian12@sha256:5e3a06cb2063751099732f72f79c9b0385d48c50005846a3b98b12c9fdc0a05c

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/
COPY src/data-layer/graphql/schema/*.graphqls /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
