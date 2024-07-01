"use client";
import { useState, useEffect, useRef } from "react";

import { createUserAction } from "@/actions/user";

import { COOKIE_NAME_FOR_USER_ID, COOKIE_NAME_FOR_IS_GUEST } from "@/constants/cookies";

function getCookie(name: string) {
    if (!document) return null;

    const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];

    if (cookieValue) return cookieValue;
    return null;
}

function setCookie(name: string, value: string, days: number = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function removeCookie(name: string) {
    // remove by setting expiry to past date
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

const getUserIdFromCookies = () => {
    return getCookie(COOKIE_NAME_FOR_USER_ID);
}

export const useCookies = () => {
    // store user id in cookies so that server can pre-fetch user data
    const [userId, setUserId] = useState<string | null>(null);
    const [isGuest, setIsGuest] = useState<boolean>(false);
    const createRef = useRef<ReturnType<typeof createUserAction> | null>(null); // keep track of any existing requests to create a guest user

    useEffect(() => {
        // check if userId exists in cookies
        setUserId(getUserIdFromCookies());
        // check for isGuest
        setIsGuest(!getCookie(COOKIE_NAME_FOR_IS_GUEST));
    }, []);

    const setUserIdCookie = (value: string) => {
        setCookie(COOKIE_NAME_FOR_USER_ID, value);
        setUserId(value);
    }

    const setIsGuestCookie = (value: boolean) => {
        setCookie(COOKIE_NAME_FOR_IS_GUEST, String(value));
        setIsGuest(value);
    }

    const createGuestUserIfNecessary = async () => {
        // check if userId already exists in cookies to avoid unnecessary user creation
        const _userId = getUserIdFromCookies();
        if (_userId) {
            console.log('user retrieved from cookies');
            return _userId;
        };

        if (createRef.current) return (await createRef.current).id; // prevent multiple requests

        createRef.current = createUserAction({ guest: true });
        console.log('guest created');

        const user = await createRef.current;
        // set cookies
        setUserIdCookie(user.id);
        setIsGuestCookie(true);
        // remove createRef
        createRef.current = null;
        return user.id;
    }

    const removeCookies = () => {
        // remove cookies from doc
        removeCookie(COOKIE_NAME_FOR_USER_ID);
        removeCookie(COOKIE_NAME_FOR_IS_GUEST);
        // update state
        setUserId(null);
        setIsGuest(false);
    }

    return {
        userId,
        isGuest,
        getUserIdFromCookies,
        setUserIdCookie,
        setIsGuestCookie,
        createGuestUserIfNecessary,
        removeCookies,
    }
}