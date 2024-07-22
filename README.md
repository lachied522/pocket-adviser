Welcome! 👋

This Next JS project is the frontend for my Pocket Adviser app. It is a chat bot intended to act as a guide for new investors. It can search the web, read news articles, and through the backend (see https://github.com/lachied522/pocket-adviser-backend) provide stock recommendations (branded as "ideas" for legal purposes).

It is deployed on Vercel and can be found at https://pocketadviser.com.au.

It uses generative UI from Vercel's AI SDK to generate interactive chat messages. See actions/ai/chat.tsx.

It uses Prisma ORM for the database, Vercel KV (hosted redis) for caching, and Auth.js for authentication.