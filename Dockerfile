FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

#Generate Prisma client 
RUN npx prisma generate

RUN npx prisma migrate dev


EXPOSE 5000
CMD [ "node", "index.js" ]FROM node:18
