
# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies (e.g. for psycopg2 if needed later)
# RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application code (keeping directory structure)
COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Run with Gunicorn -> Uvicorn
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 -k uvicorn.workers.UvicornWorker main:app
