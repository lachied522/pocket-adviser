"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { getUserIdFromCookies, setUserIdCookie } from "@/utils/cookies";

import { createUserAction } from "@/actions/crud/user";

async function createGuestUserIfNecessary() {
    // check if userId already exists in cookies to avoid unnecessary user creation
    const _userId = getUserIdFromCookies();
    if (_userId) {
        console.log('user retrieved from cookies');
        return _userId;
    };

    const user = await createUserAction({ accountType: "GUEST" });
    console.log('guest created');
                
    // set cookies
    setUserIdCookie(user.id);
    return user.id;
}

interface ContinueAsGuestButtonProps {
    disabled?: boolean
}

export default function ContinueAsGuestButton({ disabled }: ContinueAsGuestButtonProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const onClick = useCallback(
        async () => {
            setIsLoading(true);
            try {
                await createGuestUserIfNecessary();
                router.replace('/');
            } catch (e) {
                setIsLoading(false);
            }
        },
        [router, setIsLoading]
    );

    return (
        <Button
            type='button'
            variant='secondary'
            onClick={onClick}
            disabled={disabled || isLoading}
            className='h-10 border border-input shadow-sm'
        >
            Continue as guest
        </Button>
    )
}