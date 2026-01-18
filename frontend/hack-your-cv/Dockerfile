FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY bun.lock ./

# If using bun, we might want to install bun or just use npm since lock file exists but npm works too if compatible.
# Since user has bun.lock, they might prefer bun, but I'll stick to npm for broad compatibility unless requested.
# I will just run npm install.
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host"]
