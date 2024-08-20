# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /code

# Copy the Poetry configuration files
COPY poetry.lock pyproject.toml ./

# Install Poetry and project dependencies
RUN pip install --upgrade pip && \
    pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev --no-interaction --no-ansi

# Copy the rest of the application code
COPY . .

# Install python-dotenv for loading environment variables from .env
RUN pip install python-dotenv

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["poetry", "run", "uvicorn", "product.main:app", "--host", "0.0.0.0", "--port", "8000"]
