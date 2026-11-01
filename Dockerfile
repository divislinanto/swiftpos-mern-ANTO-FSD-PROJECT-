# Multi-stage Dockerfile for SwiftPOS MERN Stack
# Stage 1: Build React Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV MONGO_URI=mongodb://mongo:27017/pos_db

# Copy server package and install production dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server code
COPY server/ /app/server/

# Copy client built assets into /app/client/dist so Express can serve it
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose single port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
