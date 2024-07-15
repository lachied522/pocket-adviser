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
    isMobile: boolean
    signupRef: React.RefObject<HTMLButtonElement>
    pricingRef: React.RefObject<HTMLButtonElement>
    openSignup: () => void
    openPricing: () => void
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
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const { getUserIdFromCookies } = useCookies();
    const welcomeDialogRef = useRef<HTMLButtonElement>(null);
    const signupRef = useRef<HTMLButtonElement>(null);
    const pricingRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // add event listener for obtaining screen width
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize)
        };
    }, []);

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

    const openPricing = () => {
        if (pricingRef.current) pricingRef.current.click();
    }

    return (
        <UIContext.Provider
            value={{
                isMobile,
                signupRef,
                pricingRef,
                openSignup,
                openPricing,
            }}
        >
            {children}
            <WelcomeDialog openRef={welcomeDialogRef} />
        </UIContext.Provider>
    )
}