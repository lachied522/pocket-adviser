import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

import { COOKIE_NAME_FOR_IS_GUEST, COOKIE_NAME_FOR_USER_ID } from '@/constants/cookies';

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
export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
      Credentials({
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        name: "email",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
          if (!credentials) {
              return null;
          }

          // logic to verify if user exists
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            throw new Error("User not found.");
          }

          const passwordsMatch = await bcrypt.compare(credentials.password as string, user.hashedPassword!);

          if (!passwordsMatch) {
              throw new Error("Passwords do not match.");
          }

          // return user object with the their profile data
          return user;
        },
      }),
      GoogleProvider({
        allowDangerousEmailAccountLinking: true,
      }),
      GitHubProvider({
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
            cookieStore.set({ name: COOKIE_NAME_FOR_IS_GUEST, value: "false", maxAge: defaultExpiry });
        }
        // revalidate path
        revalidatePath('/', 'layout');
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
});