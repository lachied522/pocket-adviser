"use client";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

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
    const signupRef = useRef<HTMLButtonElement>(null);

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
        </UIContext.Provider>
    )
}