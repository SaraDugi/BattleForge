# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the runtime image
FROM node:18-alpine
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the built app from the builder stage
COPY --from=builder /app/dist ./dist

# Optionally include any static assets, if needed
# COPY --from=builder /app/public ./public

# Expose the application port
EXPOSE 7000

# Define environment variables (can be overridden by Docker Compose or CI/CD)
ENV DB_HOST=battleservice-battleservice.j.aivencloud.com \
    DB_PORT=28148 \
    DB_USERNAME=avnadmin \
    DB_PASSWORD=AVNS_kAk_pQN6MIBlYh9_2PH \
    DB_NAME=defaultdb \
    ACTIVEMQ_HOST=localhost \
    ACTIVEMQ_PORT=61613 \
    ACTIVEMQ_USERNAME=admin \
    ACTIVEMQ_PASSCODE=admin

# Start the application
CMD ["node", "dist/main.js"]