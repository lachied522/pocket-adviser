"use client";
import { useState, useEffect, useRef } from "react";

import { createUserAction } from "@/actions/user";

import { COOKIE_NAME_FOR_GUEST_USER_ID } from "@/constants/cookies";

function getCookie(name: string) {
    if (!document) return null;

    const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];

    if (cookieValue) return cookieValue;
    return null;
}

function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/`;
}

const getGuestFromCookies = () => {
    return getCookie(COOKIE_NAME_FOR_GUEST_USER_ID);
}

export const useGuest = () => {
    const [guestId, setGuestId] = useState<string | null>(null);
    const createRef = useRef<ReturnType<typeof createUserAction> | null>(null)

    const setGuestCookie = (value: string) => {
        setCookie(COOKIE_NAME_FOR_GUEST_USER_ID, value);
        setGuestId(value);
    }

    const createGuestUserIfNecessary = async () => {
        // check if userId already exists in cookies to avoid unnecessary user creation
        const _userId = getGuestFromCookies();
        if (_userId) {
            console.log('guest retrieved from cookies');
            return _userId;
        };

        if (createRef.current) return (await createRef.current).id; // prevent multiple requests

        createRef.current = createUserAction({ guest: true });
        console.log('guest created');

        const user = await createRef.current;
        // set cookie
        setGuestCookie(user.id);
        // remove createRef
        createRef.current = null;
        return user.id;
    }

    useEffect(() => {
        // check if userId exists in cookies
        setGuestId(getGuestFromCookies());
    }, []);

    return {
        guestId,
        getGuestFromCookies,
        createGuestUserIfNecessary,
    }
}