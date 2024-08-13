# First Build the Next.js App
FROM node:18 AS build

# Set the Working Directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY ./Imtiaz_mart/online_imtiaz_mart/package*.json ./

# Install Dependencies
RUN npm install

# Copy the rest of the Next.js app code
COPY ./Imtiaz_mart/online_imtiaz_mart ./

# Build the Next.js app
RUN npm run build


# Build the FastAPI
FROM python:3.11 AS fastapi

# Set the Working Directory
WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy and Install dependencies for each FastAPI directory
COPY ./auth/pyproject.toml .auth/
RUN poetry install --no-root --cwd .auth

COPY ./product/pyproject.toml .product/
RUN poetry install --no-root --cwd .product

COPY ./user/pyproject.toml .user/
RUN poetry install --no-root --cwd .user

COPY ./order/pyproject.toml .order/
RUN poetry install --no-root --cwd .order


# Copy the FastAPI application code after installing dependencies
COPY ./auth ./auth/
COPY ./product ./product/
COPY ./user ./user/
COPY ./order ./order/

# Final Stage
FROM python:3.11

# Set Working Directory
WORKDIR /CompanyProject/Project/mart-products

# Copy the FastAPI apps from the previous stage
COPY --from=fastapi .auth ./auth
COPY --from=fastapi .product ./product
COPY --from=fastapi .order ./order
COPY --from=fastapi .user ./user

# Copy the Next.js build output from the previous stage
COPY --from=build /app/.next /app/frontend/.next
COPY --from=build /app/public /app/frontend/public

# Install Uvicorn Server
RUN pip install uvicorn

# Expose Ports
EXPOSE 3000
EXPOSE 8000
EXPOSE 8001
EXPOSE 8002
EXPOSE 8003

# Add a script to start all services
COPY start.sh start.sh
RUN chmod +x start.sh

# Command to run FastAPI and Next.js apps
CMD ["start.sh"]