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
WORKDIR /CompanyProject/Project/mart-products

# Install Poetry
RUN pip install poetry

# Copy and Install dependencies for each FastAPI directory
COPY ./auth/pyproject.toml /CompanyProject/Project/mart-products/auth/
RUN poetry install --no-root --cwd /CompanyProject/Project/mart-products/auth

COPY ./product/pyproject.toml /CompanyProject/Project/mart-products/product/
RUN poetry install --no-root --cwd /CompanyProject/Project/mart-products/product

COPY ./user/pyproject.toml /CompanyProject/Project/mart-products/user/
RUN poetry install --no-root --cwd /CompanyProject/Project/mart-products/user

COPY ./order/pyproject.toml /CompanyProject/Project/mart-products/order/
RUN poetry install --no-root --cwd /CompanyProject/Project/mart-products/order


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
COPY --from=fastapi /CompanyProject/Project/mart-products/auth ./auth
COPY --from=fastapi /CompanyProject/Project/mart-products/product ./product
COPY --from=fastapi /CompanyProject/Project/mart-products/order ./order
COPY --from=fastapi /CompanyProject/Project/mart-products/user ./user

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
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Command to run FastAPI and Next.js apps
CMD ["/start.sh"]