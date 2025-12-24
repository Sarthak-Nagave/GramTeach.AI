# -------------------------------
# Base image
# -------------------------------
FROM node:20-alpine

# -------------------------------
# Set working directory
# -------------------------------
WORKDIR /app

# -------------------------------
# Install dependencies
# -------------------------------
COPY package*.json ./
RUN npm install

# -------------------------------
# Copy source and build
# -------------------------------
COPY . .
RUN npm run build

# -------------------------------
# Expose Vite preview port
# -------------------------------
EXPOSE 5173

# -------------------------------
# Start frontend
# -------------------------------
CMD ["npm", "run", "preview", "--", "--host"]
