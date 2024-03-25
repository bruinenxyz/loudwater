FROM node:18 as buildWithTsc

# Because typescript is a devDependency, first, need to build in non-prod mode
ENV NODE_ENV=development

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if using npm) or yarn.lock (if using yarn)
COPY ./package.json ./
COPY ./yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN yarn prisma generate

RUN yarn run build

FROM node:18 as production

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if using npm) or yarn.lock (if using yarn)
COPY ./package.json ./
COPY ./yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

COPY --from=buildWithTsc /usr/src/app/dist ./dist
COPY ./prisma .
COPY --chown=node:node --from=buildWithTsc /usr/src/app/node_modules/.prisma/client  ./node_modules/.prisma/client

CMD ["yarn", "start:migrate:prod"]