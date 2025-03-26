# AI Podcast Studio

An innovative application that utilizes AI to generate podcast scripts and assist content creators in their podcast production workflow.

## Features

- **AI Script Generator**: Create professional podcast scripts powered by AI
- **Research Generator**: Generate research based on trending topics
- **Saved Scripts Management**: Save, organize, and manage your podcast scripts
- **Team Collaboration**: Share scripts with team members and collaborate on content
- **Firebase Integration**: User authentication and data storage with Firebase

## Tech Stack

- **Framework**: Next.js 15
- **UI Library**: Material UI
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **API Integration**: OpenAI, Google Cloud
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-podcast.git
   cd ai-podcast
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:
   ```
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Set up the environment variables
4. Deploy!

## Firebase Setup

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up the security rules for Firestore

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for providing the API for script generation
- Firebase for authentication and database services
- Vercel for hosting the application
