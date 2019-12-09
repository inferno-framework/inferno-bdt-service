FROM node:12.1

WORKDIR /app

# Install gems into a temporary directory
COPY . /app
RUN npm install

# Expose the port
EXPOSE 4500

CMD ["npm", "start"]
