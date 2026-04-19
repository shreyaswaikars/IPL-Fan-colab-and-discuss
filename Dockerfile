FROM node:18

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy client and server package files
COPY client/package.json client/
COPY server/package.json server/

# Install dependencies
RUN npm run install:all

# Copy all source files
COPY . .

# Build the client
RUN cd client && npm run build

# Start the server
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "run", "start:server"]
