# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose API port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]
