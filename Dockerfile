FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Add a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install dependencies first (better layer caching)
COPY package*.json ./
# Use npm install instead of npm ci since there's no package-lock.json
RUN npm install --omit=dev

# Copy app source with proper ownership
COPY --chown=appuser:appgroup . .

# Expose the port the app will run on
EXPOSE 5000

# Switch to non-root user
USER appuser

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
