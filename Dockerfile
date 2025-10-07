FROM gcr.io/distroless/nodejs24-debian12@sha256:10399fcb07704d1bc2fbf9d464db179bb525aa360ed86628ef652ef43609ff96

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
