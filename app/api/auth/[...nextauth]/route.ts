import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

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
export const handler = NextAuth({
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
            where: { email: credentials.email }
          });

          if (!user) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            throw new Error("User not found.");
          }

          const passwordsMatch = await bcrypt.compare(credentials.password, user.hashedPassword!);

          if (!passwordsMatch) {
              throw new Error("Passwords do not match.");
          }

          // return user object with the their profile data
          return user;
        },
      }),
    ],
    callbacks: {
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
    },
    secret: process.env.AUTH_SECRET
});

export { handler as GET, handler as POST };