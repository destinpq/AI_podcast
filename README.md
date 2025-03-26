This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up the environment variables:

1. Create a `.env.local` file in the root directory if it doesn't exist
2. Add your OpenAI API key: `OPENAI_API_KEY=your_openai_api_key`
3. For trending topics functionality, get a free NewsAPI key from [NewsAPI.org](https://newsapi.org/register) and add it:
   `NEWS_API_KEY=your_newsapi_key`

> **Note:** The application includes fallback mock data if the NewsAPI key is not provided, but for the best experience, it's recommended to use a real API key.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

### AI Podcast Script Generation

This application helps you create podcast scripts using AI with the following features:

- Topic-based script generation
- Trending topics visualization
- Script outline customization
- Multi-member podcast support
- AI-driven script evaluation

### Trending Topics

The application shows trending topics related to your podcast subject using:

- News articles from NewsAPI (or mock data if no API key is provided)
- Generated discussion topics
- Related search queries

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
