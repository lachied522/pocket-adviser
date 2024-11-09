import { signIn } from "next-auth/react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function GoogleSigninButton() {
    return (
        <Button
            type='button'
            variant='outline'
            onClick={() => {
                signIn("google", { redirect: true, callbackUrl: '/' });
            }}
            className='h-10 flex flex-row items-center gap-2'
        >
            <Image
                src='/google-logo.png'
                alt="Google logo"
                height={18}
                width={18}
                sizes="18px"
            />
            Signin with Google
        </Button>
    )
}