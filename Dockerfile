# Dockerfile
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install -g expo-cli
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app for web
RUN npx expo export --output-dir=web-build --platform web

# Serve the built web app
FROM nginx:alpine
COPY --from=build /app/web-build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]