# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the final production image
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/main"] 