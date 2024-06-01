# Use the official Node.js 20 image as the base image
FROM node:20

# Copy the package.json and pnpm-lock.yaml files to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install the app dependencies using pnpm
RUN pnpm install

# Copy the rest of the app source code to the working directory
COPY . .

# Expose the port that the app will listen on
EXPOSE 5000:5000

# Start the app
RUN pnpm build
CMD ["pnpm", "start"]
