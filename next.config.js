/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
  // We're using a custom server, so we need to disable automatic static optimization
  // This is required for Socket.io integration
  output: undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
};

module.exports = nextConfig;
