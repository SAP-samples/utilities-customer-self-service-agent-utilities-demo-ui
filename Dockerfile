# Stage 1 - build the SAPUI5 app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json ./
RUN npm install

# Copy the full source
COPY . .

# Build the UI5 app (output goes to ./dist)
RUN npx ui5 build --config ui5-build.yaml --clean-dest

# Stage 2 - serve with nginx
FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built UI to nginx html root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
