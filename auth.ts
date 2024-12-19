import { cookies } from 'next/headers';
import { AuthError, type NextAuthConfig } from "next-auth";

import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

import { COOKIE_NAME_FOR_USER_ID } from '@/constants/cookies';

import type { DefaultSession } from "@auth/core/types"

const prisma = new PrismaClient();

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const adapter = PrismaAdapter(prisma);

// see https://next-auth.js.org/getting-started/example
export const authOptions: NextAuthConfig = {
    providers: [
      Credentials({
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        name: "email",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        authorize: async ({ email, password }) => {
          if (!email) {
            throw new AuthError("Email required");
          }

          if (!password) {
            throw new AuthError("Password required");
          }

          const user = await prisma.user.findUnique({
              where: { email: email as string },
          });

          if (!user) {
              // this error will never reach the client, will show as uncaught error on server
              // see https://github.com/nextauthjs/next-auth/discussions/8999
              throw new AuthError("User not found");
          }

          const passwordsMatch = await bcrypt.compare(password as string, user.hashedPassword!);

          if (!passwordsMatch) {
              throw new AuthError("Passwords do not match");
          }

          return user;
        },
      }),
      GoogleProvider({
        allowDangerousEmailAccountLinking: true,
      }),
    ],
    callbacks: {
      signIn({ user }) {
        // update cookies
        const cookieStore = cookies();
        const defaultExpiry = 7 * 24 * 60 * 60 * 1000; // one week
        if (user.id) {
            cookieStore.set({ name: COOKIE_NAME_FOR_USER_ID, value: user.id, maxAge: defaultExpiry });
        }
        return true;
      },
      jwt({ token, user }) {
        token.id = user?.id;
        return token;
      },
      session({ session, token }) {
        // append id to user
        if (token.sub) session.user.id = token.sub;
        return session;
      }
    },
    adapter,
    session: {
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    },
    secret: process.env.AUTH_SECRET
};