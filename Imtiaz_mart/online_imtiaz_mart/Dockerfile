# Stage 1: Build the Next.js app
FROM node:18 AS build

WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Serve the Next.js app in a smaller production image
FROM node:18-alpine AS production

WORKDIR /app/frontend

# Copy the build output and necessary files from the previous stage
COPY --from=build /app/frontend/.next ./.next
COPY --from=build /app/frontend/node_modules ./node_modules
COPY --from=build /app/frontend/public ./public
COPY --from=build /app/frontend/package*.json ./

# Install only production dependencies
RUN npm install --production

EXPOSE 3000

# Start the application with developement server 
CMD ["npm", "run", "dev"]
