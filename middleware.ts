import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;
  
    // if user is signed in
    if (userId && req.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  
    // if user is not signed in and the current path is not /login redirect the user to /login
    if (!userId && req.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  
    return res;
  }
  
  export const config = {
    matcher: ['/', '/login', '/c/:path*', '/education/:path*'],
  }