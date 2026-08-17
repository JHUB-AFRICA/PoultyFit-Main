# --- Build stage --------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies. Using npm install rather than npm ci here: the
# lockfile records platform-specific optional dependencies (Cloudflare's
# workerd, sharp) for whichever OS generated it, and npm ci's strict
# lockfile-matching can fail across platforms (e.g. lockfile generated on
# Windows, build running on Linux). npm install resolves gracefully instead.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Copy the rest of the source and build the Node-server target.
# This uses vite.config.docker.ts (Nitro/Node), NOT vite.config.ts
# (Cloudflare) ? the Cloudflare deploy is untouched by this image.
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
