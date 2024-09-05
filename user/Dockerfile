# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /user

# Copy the Poetry configuration files
COPY poetry.lock  ./
COPY pyproject.toml ./

# Install Poetry and project dependencies
RUN pip install --upgrade pip --root-user-action=ignore && \
    pip install poetry && \
    poetry lock --no-update && \
    poetry install




# Copy the rest of the application code
COPY . .

# Copy the env file
COPY .env .

# Install python-dotenv for loading environment variables from .env
RUN pip install python-dotenv

RUN pip install uvicorn

# Expose the port the app runs on
EXPOSE 8002

# Command to run the application
CMD ["poetry", "run", "uvicorn", "user.main:app", "--host", "0.0.0.0", "--port", "8002","--reload"]
