FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Install dependencies first, for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy built assets and production dependencies
COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./
RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.js"]

# Development stage
FROM base AS development
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
