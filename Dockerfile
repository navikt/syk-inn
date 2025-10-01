FROM denoland/deno:distroless-2.5.2@sha256:fa186b5128ad3a95cca539ab3af738c522ba793bfbe71b7aa983daaba573bcd4

WORKDIR /app

COPY next-logger.config.js /app/
COPY .next/standalone /app/
copy deno.jsonc /app/

EXPOSE 3000

ENV NODE_ENV=production

CMD ["--unstable-detect-cjs","--no-prompt","-P","server.js"]
