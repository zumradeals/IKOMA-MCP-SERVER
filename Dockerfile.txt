FROM node:20-alpine

# Install PostgreSQL client for backups
RUN apk add --no-cache postgresql-client docker-cli

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src

# Build TypeScript
RUN npm run build

# Create necessary directories
RUN mkdir -p /srv/apps /var/log/ikoma /var/backups/ikoma

# Set executable
RUN chmod +x dist/index.js

EXPOSE 3000

CMD ["node", "dist/index.js"]