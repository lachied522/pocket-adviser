

export default function Footer() {


    return (
        <div className='w-full flex items-center justify-center px-6 py-12 md:py-20 mt-12 bg-sky-800 opacity-90'>
            <div className='max-w-md md:max-w-lg flex flex-col items-center gap-3.5'>
                <p className='text-white'>
                    <span className='font-medium'>Disclaimer</span>
                    <br /><br />
                    Pocket Adviser is intended to be educational only and is not intended to replace formal financial
                    advice. The ideas presented by Pocket Adviser should not be taken as recommendation to buy
                    or sell any securities. The decision to buy or sell securities lies with you, and we do not take any
                    responsibility for the outcome of those transactions.
                </p>
                <p className='text-white'>
                    Created by Lachie Duncan
                </p>
            </div>
        </div>
    )
}