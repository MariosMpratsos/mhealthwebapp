FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# 1. Accept the argument sent from GitHub Actions build-args
ARG REACT_APP_GOOGLE_CLIENT_ID

# 2. Make it available to the Node process during build time
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

# 3. React embeds the value directly into the static JS files here
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
