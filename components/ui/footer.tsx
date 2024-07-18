// import { Button } from "@/components/ui/button";

export default function Footer() {
    return (
        <div className='w-full flex items-center justify-center px-6 py-6 md:py-12 md:mt-12 bg-sky-800 opacity-90'>
            <div className='max-w-md md:max-w-lg flex flex-col items-stretch gap-3.5'>
                <p className='text-sm text-white'>
                    <span id='disclaimer' className='font-medium'>Disclaimer:</span>
                    <br /><br />
                    Pocket Adviser is for educational purposes only.
                    Any information or ideas presented by Pocket Adviser are not intended to be formal financial advice,
                    and the decision to buy or sell securities lies with you.
                    Please consult a certified financial advisor if you require advice.
                </p>
                {/* <p className='text-white'>
                    Created by Lachie Duncan
                </p> */}
                {/* <div className='flex flex-row items-center gap-3.5'>
                    <span id='contact' className='text-sm text-white font-medium'>Contact:</span>
                    <a href="mailto:lachie@pocketadviser.com.au">
                        <Button
                            type='button'
                            variant='ghost'
                            className='text-sm text-white hover:text-white hover:bg-slate-100/10 p-2'
                        >
                            Send me an email
                        </Button>
                    </a>
                </div> */}
            </div>
        </div>
    )
}