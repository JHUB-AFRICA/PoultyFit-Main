# --- Build stage --------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (better layer caching: this layer only
# rebuilds when package*.json changes, not on every source edit)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build the Node-server target.
# This uses vite.config.docker.ts (Nitro/Node), NOT vite.config.ts
# (Cloudflare) — the Cloudflare deploy is untouched by this image.
COPY . .
RUN npm run build:docker

# --- Runtime stage --------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Only the compiled output is needed at runtime, not the source, not
# node_modules (Nitro bundles all server dependencies into .output itself).
COPY --from=builder /app/.output /app/.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]