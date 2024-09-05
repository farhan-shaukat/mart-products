# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /order

# Copy the Poetry configuration files
COPY poetry.lock pyproject.toml ./

# Install Poetry and project dependencies
RUN pip install --upgrade pip --root-user-action=ignore && \
    pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple poetry && \
    poetry lock --no-update && \
    poetry install

# Copy the rest of the application code
COPY . .

# Install python-dotenv for loading environment variables from .env
RUN pip install python-dotenv

# Expose the port the app runs on
EXPOSE 8003

# Command to run the application
CMD ["poetry", "run", "uvicorn","order.main:app", "--host", "0.0.0.0", "--port", "8003", "--reload"]
