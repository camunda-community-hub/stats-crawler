# dockerfile
# the first image use node image as the builder because it has git program
FROM node:alpine as builder

WORKDIR /app

COPY ["./package.json", "./package-lock.json", "/app/"]

RUN npm ci

COPY "./" "/app/"

## compile typescript
RUN npm run build

## remove packages of devDependencies
RUN npm prune --production

# ===============
# the second image use node:slim image as the runtime
FROM node:alpine as runtime

WORKDIR /app
ENV NODE_ENV=production

## Copy the necessary files form builder
COPY --from=builder "/app/dist/" "/app/dist/"
COPY --from=builder "/app/node_modules/" "/app/node_modules/"
COPY --from=builder "/app/package.json" "/app/package.json"

CMD ["npm", "run", "start:prod"]