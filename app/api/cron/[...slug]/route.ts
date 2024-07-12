import { type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // opt out of caching

function isMonday(date: Date) {
    return date.getDay() === 1
}

function isFirstMondayOfMonth(date: Date) {
    // Check if today is the first Monday of the month
    return isMonday(date) && date.getDate() <= 7;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string[] } }
) {
    // docs: https://vercel.com/docs/cron-jobs/manage-cron-jobs
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    // the refresh-data and send-emails tasks are too long to run in serverless environment
    // we will pass on to backend to handle
    const url = new URL(`${process.env.BACKEND_URL}/${params.slug[0]}`);
    // set query params
    const searchParams = new URLSearchParams();
    switch (params.slug[0]) {
        case "refresh-data": {
            // add exchanges to query params
            searchParams.append('exchange', ["NASDAQ", "NYSE", "ASX"].join(","));
            break
        }
        case "send-emails": {
            // daily emails are sent every day
            let frequency = ['daily'];
            // must check whether weekly and monthly emails should be sent today
            const today = new Date();
            // weekly emails are sent on Monday
            if (isMonday(today)) {
                frequency.push('weekly');
            }
            // monthly emails are sent on first Monday of the month
            if (isFirstMondayOfMonth(today)) {
                frequency.push('monthly');
            }
            searchParams.append('frequency', frequency.join(','));
            break
        }
    }

    url.search = searchParams.toString();
    const res = await fetch(
        url,
        {
            method: "GET",
        }
    );

    if (!res.ok) {
        return new Response('Bad Gateway', {
            status: 502
        });
    }

    return new Response('Created', {
        status: 201
    });
}