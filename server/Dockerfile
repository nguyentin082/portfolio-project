# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY server/package.json server/yarn.lock ./

# Install the application dependencies
RUN yarn install

# Copy the rest of the application files
COPY server .

# Build the NestJS application
RUN yarn build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]