/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only enable serverActions if you're actually using React Server Actions
  // experimental: {
  //   serverActions: {
  //     allowedOrigins: [
  //       'localhost:3000', 
  //       'ai-podcast-app.vercel.app',
  //       'ai-podcast.vercel.app',
  //       '*.vercel.app'
  //     ],
  //   },
  // },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

module.exports = nextConfig