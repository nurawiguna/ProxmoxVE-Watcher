# Multi-stage build for Vue.js frontend - Production Ready
# Stage 1: Build stage
FROM node:18-alpine AS builder

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies - use npm install for better compatibility
# We need dev dependencies for build tools like Vite
RUN npm install --silent && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Production stage with nginx
FROM nginx:1.27-alpine AS release

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Use dumb-init to handle signals properly and start nginx
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]