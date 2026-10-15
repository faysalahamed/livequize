# ===================================================
# Stage 1: Base image with system dependencies
# ===================================================
FROM node:20-alpine AS base

# Install libc6-compat and openssl for Prisma engines on Alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ===================================================
# Stage 2: Install dependencies & generate Prisma client
# ===================================================
FROM base AS deps

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies required for build)
RUN npm ci

# Generate Prisma Client for Linux platform
RUN npx prisma generate

# ===================================================
# Stage 3: Build the Next.js application
# ===================================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy DATABASE_URL during build for Prisma validation if needed
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js production bundle
RUN npm run build

# ===================================================
# Stage 4: Production Runner
# ===================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy runtime files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
