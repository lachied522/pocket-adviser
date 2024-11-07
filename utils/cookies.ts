"use client";
import { COOKIE_NAME_FOR_USER_ID, COOKIE_NAME_FOR_IS_GUEST } from "@/constants/cookies";

function getCookie(name: string) {
    try {
        const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`))
        ?.split('=')[1];
    
        if (cookieValue) return cookieValue;
        return null;
    } catch (e) {
        return null;
    }
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

export function getUserIdFromCookies() {
    return getCookie(COOKIE_NAME_FOR_USER_ID);
}

export function getIsGuestFromCookies() {
    return getCookie(COOKIE_NAME_FOR_IS_GUEST) === "true";
}

export function setUserIdCookie(value: string) {
    setCookie(COOKIE_NAME_FOR_USER_ID, value);
}

export function setIsGuestCookie(value: boolean) {
    setCookie(COOKIE_NAME_FOR_IS_GUEST, String(value));
}

export function removeCookies() {
    // remove cookies from doc
    removeCookie(COOKIE_NAME_FOR_USER_ID);
    removeCookie(COOKIE_NAME_FOR_IS_GUEST);
}