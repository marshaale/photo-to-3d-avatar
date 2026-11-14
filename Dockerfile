
# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

# ==========================================
# Stage 2: Production
# ==========================================
FROM oven/bun:1-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Copy application files
COPY --from=deps --chown=appuser:appgroup /app/node_modules /app/node_modules
COPY --chown=appuser:appgroup package.json /app/
COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 8080

CMD ["bun", "run", "start"]