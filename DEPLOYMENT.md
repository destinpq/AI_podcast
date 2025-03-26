# Deployment Guide for AI Podcast Studio

This guide will walk you through deploying the AI Podcast Studio application to Vercel.

## Prerequisites

1. A [GitHub](https://github.com/) account with your code pushed to a repository
2. A [Vercel](https://vercel.com/) account (you can sign up with your GitHub account)
3. A [Firebase](https://firebase.google.com/) project with authentication and Firestore set up
4. An [OpenAI API key](https://platform.openai.com/api-keys)

## Deployment Steps

### Option 1: Deploy from Vercel Dashboard (Recommended for first deployment)

1. **Login to Vercel**: Go to [vercel.com](https://vercel.com/) and login with your account.

2. **Import Your Repository**:
   - Click "Add New Project"
   - Import your GitHub repository
   - If you don't see your repository, click "Adjust GitHub App Permissions" and add access to your repository

3. **Configure Project Settings**:
   - Project Name: Choose a name or use the default
   - Framework Preset: Next.js (should be auto-detected)
   - Build and Output Settings: Leave as default (our `vercel.json` will handle this)

4. **Set Environment Variables**:
   Add the following environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
   - `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NEXT_DISABLE_ESLINT` - Set to "1" (for build optimization)

5. **Deploy**: Click "Deploy" and wait for the build to complete.

### Option 2: Deploy from the Command Line

1. **Install Vercel CLI**:
   ```
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```
   vercel login
   ```

3. **Navigate to Your Project**:
   ```
   cd /path/to/ai-podcast
   ```

4. **Set Up Environment Variables**:
   Create a `.vercel/.env.production` file with all required environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_value
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
   NEXT_PUBLIC_FIREBASE_APP_ID=your_value
   OPENAI_API_KEY=your_value
   NEXT_DISABLE_ESLINT=1
   ```

5. **Deploy**:
   ```
   yarn deploy
   ```
   OR
   ```
   vercel deploy --prod
   ```

6. **Follow the Interactive Prompts** from the Vercel CLI.

## Post-Deployment

1. **Set Up Custom Domain (Optional)**:
   - Go to your project on Vercel dashboard
   - Go to "Settings" > "Domains"
   - Add your custom domain and follow instructions

2. **Set Up Firestore Indexes**:
   The first time you use certain queries, Firestore will show an error with a link to create needed indexes.
   - Click the link in the error message
   - Create the required indexes
   - Wait for indexes to be ready (can take a few minutes)

3. **Testing**:
   - Visit your deployed site
   - Test user registration and login
   - Test script generation
   - Test saving and loading scripts

## Troubleshooting

- **Build Errors**: Check build logs in Vercel dashboard
- **API Errors**: Check function logs in Vercel dashboard
- **Firebase Errors**: Check Firebase console for authentication or database issues
- **CORS Issues**: Make sure your `serverActions.allowedOrigins` in `next.config.js` includes your domain
- **Environment Variables**: Verify all environment variables are set correctly

## Continuous Deployment

Vercel automatically deploys when you push changes to your connected repository. You can configure this behavior in the Vercel dashboard under your project settings.

## Rollbacks

If something goes wrong with a deployment, you can easily roll back:
1. Go to your project on Vercel dashboard
2. Go to "Deployments" tab
3. Find the previous working deployment
4. Click the three dots menu and select "Promote to Production" 