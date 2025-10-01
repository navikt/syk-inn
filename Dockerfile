FROM denoland/deno:distroless-2.6.0@sha256:df28d7173d68a386acacab9cc768ec7a1a67d81700e085fa923afaabff1602b9

WORKDIR /app

COPY next-logger.config.cjs /app/
COPY .next/standalone /app/
COPY deno.jsonc /app/

EXPOSE 3000

ENV NODE_ENV=production

CMD ["--unstable-detect-cjs","--no-prompt","-P","server.js"]
