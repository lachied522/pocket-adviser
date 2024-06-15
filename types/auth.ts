import type { DefaultSession } from "next-auth";

export interface User extends DefaultSession {
    id: string;
}