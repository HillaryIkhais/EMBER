# Use an image that has both Python and Node.js
FROM nikolaik/python-nodejs:python3.11-nodejs20

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt backend/
# Ensure fastapi, uvicorn, and google-genai are in requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install frontend dependencies and build
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ frontend/
# Build Next.js
RUN cd frontend && npm run build

# Copy backend code
COPY backend/ backend/

# Create a start script to run both servers concurrently
RUN echo '#!/bin/bash\n\n# Start FastAPI Backend on port 8000\ncd /app/backend\npython -m uvicorn main:app --host 0.0.0.0 --port 8000 &\n\n# Start Next.js Frontend on port 3000\ncd /app/frontend\nnpm start -- -p 3000\n' > /app/start.sh
RUN chmod +x /app/start.sh

# Expose both ports
EXPOSE 3000
EXPOSE 8000

CMD ["/app/start.sh"]
