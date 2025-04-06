# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package files and install all dependencies including dev dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the final production image
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Expose the port the app runs on
EXPOSE 7778

# Command to run the application
CMD ["node", "dist/main"] 