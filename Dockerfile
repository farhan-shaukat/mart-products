# First Build the Next.js App
FROM node:18 AS build

# Set the Working Directory
WORKDIR /app/frontend

# Copy the package.json and package-lock.json files
COPY ./Imtiaz_mart/online_imtiaz_mart/package.json /app/frontend

# Install Dependencies
WORKDIR /app/frontend
RUN npm install

# Copy the rest of the Next.js app code
COPY ./Imtiaz_mart/online_imtiaz_mart /app/frontend

# Build the Next.js app
RUN npm run build

# Build the FastAPI
FROM python:3.12 AS fastapi

# Set the Working Directory
WORKDIR /backend

# Install Poetry
RUN pip install poetry

# Copy and Install dependencies for each FastAPI directory
COPY ./auth/pyproject.toml /backend/auth/
WORKDIR /backend/auth
RUN poetry install --no-root

COPY ./product/pyproject.toml /backend/product/
WORKDIR /backend/product
RUN poetry install --no-root

COPY ./user/pyproject.toml /backend/user/
WORKDIR /backend/user
RUN poetry install --no-root

COPY ./order/pyproject.toml /backend/order/
WORKDIR /backend/order
RUN poetry install --no-root

# Reset Working Directory
WORKDIR /backend

# Copy the FastAPI application code after installing dependencies
COPY ./auth ./auth/
COPY ./product ./product/
COPY ./user ./user/
COPY ./order ./order/

# Final Stage
FROM python:3.12-alpine


# Install Node.js and npm in the Alpine image
RUN apk add --no-cache nodejs npm

# Set the Working Directory for Next.js
WORKDIR /app/frontend

# Copy the Next.js build output from the previous stage
COPY --from=build /app/frontend/.next ./.next
COPY --from=build /app/frontend/public ./public

# Set the Working Directory for FastAPI
WORKDIR /backend

# Copy the FastAPI apps from the previous stage
COPY --from=fastapi /backend/auth ./auth
COPY --from=fastapi /backend/product ./product
COPY --from=fastapi /backend/order ./order
COPY --from=fastapi /backend/user ./user

# Install Uvicorn Server
RUN pip install uvicorn

# Expose Ports
EXPOSE 3000
EXPOSE 8000
EXPOSE 8001
EXPOSE 8002
EXPOSE 8003

# Add a script to start all services
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Command to run FastAPI and Next.js apps
CMD ["/start.sh"]
