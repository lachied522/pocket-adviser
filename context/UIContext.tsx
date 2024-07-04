"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

import { useCookies } from "@/hooks/useCookies";

import WelcomeDialog from "@/components/modals/welcome-dialog";

export type UIState = {
    signupRef: React.RefObject<HTMLButtonElement>
    openSignup: () => void
}

const UIContext = createContext<any>(null);

export const useUIContext = () => {
  return useContext(UIContext);
}

interface UIProviderProps {
    children: React.ReactNode
}

export function UIProvider({
  children,
}: UIProviderProps) {
    const { getUserIdFromCookies } = useCookies();
    const welcomeDialogRef = useRef<HTMLButtonElement>(null);
    const signupRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!getUserIdFromCookies()) {
            // open welcome dialog after three seconds
            setTimeout(() => {
                if (welcomeDialogRef.current) welcomeDialogRef.current.click();
            }, 3000);
        }
    }, []);

    const openSignup = () => {
        if (signupRef.current) signupRef.current.click();
    }

    return (
        <UIContext.Provider
            value={{
                signupRef,
                openSignup,
            }}
        >
            {children}
            <WelcomeDialog openRef={welcomeDialogRef} />
        </UIContext.Provider>
    )
}