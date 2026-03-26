FROM gcr.io/distroless/nodejs24-debian12@sha256:fb614bb0790340827f5bddb1a4f70039cb79b13cd4afdafb744da67fa8008a4f

WORKDIR /app

# Next.js app
COPY next-logger.config.cjs /app/
COPY .next/standalone /app/

# Typst + static typst files
COPY typst-pdf /app/typst-pdf

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

CMD ["server.js"]
