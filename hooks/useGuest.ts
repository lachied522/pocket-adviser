"use client";
import { createUserAction } from "@/actions/user";
import { useState, useEffect } from "react";

const COOKIE_NAME_FOR_GUEST_USER_ID = "userId";

const getCookie = (name: string) => {
    let cookieArray = document.cookie.split(';');
    let cookie = cookieArray.find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
};

const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value}; path=/`;
}

export const useGuest = () => {
    const [userId, setUserId] = useState<string | null>(null);

    const createGuestUser = async () => {
        if (userId) return userId;
        const user = await createUserAction({});

        console.log({ user });
        setUserId(user.id);
        setCookie(COOKIE_NAME_FOR_GUEST_USER_ID, user.id);
        return user.id;
    }

    useEffect(() => {
        // check if userId exists in cookies
        const _userId = getCookie('userId');
        if (_userId) {
            setUserId(_userId);
        }
    }, []);

    return {
        userId,
        createGuestUser,
    }
}