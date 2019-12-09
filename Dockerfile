FROM node:12.1

WORKDIR /app

RUN npm install pm2 -g

# Install gems into a temporary directory
COPY . /app
RUN npm install

# Expose the port
EXPOSE 4500

CMD ["pm2-runtime", "index.js"]
