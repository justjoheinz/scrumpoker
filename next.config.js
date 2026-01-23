/** @type {import('next').NextConfig} */
const nextConfig = {
  // We're using a custom server, so we need to disable automatic static optimization
  // This is required for Socket.io integration
  output: undefined,
};

module.exports = nextConfig;
