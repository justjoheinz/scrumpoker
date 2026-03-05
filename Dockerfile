# ========== Build Stage ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
# Use BuildKit cache mount to persist npm cache across builds
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source code
COPY . .

# Build-time base path arg (e.g. /scrumpoker)
ARG BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=${BASE_PATH}

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# ========== Production Stage ==========
FROM node:20-alpine AS runner

WORKDIR /app

# Build-time base path arg must be redeclared in each stage
ARG BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=${BASE_PATH}

# Set environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Use BuildKit cache mount to persist npm cache across builds
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
