# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /auth

# Copy the Poetry configuration files
COPY pyproject.toml ./
COPY poetry.lock  ./

# Install Poetry and project dependencies
RUN pip install --upgrade pip --root-user-action=ignore && \
    pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple poetry && \
    poetry lock --no-update && \
    poetry install


# Copy the rest of the application code
COPY . .

# Copy env file
COPY .env ./

# Install python-dotenv for loading environment variables from .env
RUN pip install python-dotenv

# Expose the port the app runs on
EXPOSE 8001

# Command to run the application
CMD ["poetry", "run", "uvicorn", "auth.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
