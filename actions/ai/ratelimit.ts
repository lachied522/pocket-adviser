import { headers } from 'next/headers';

import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = {
    slider: new Ratelimit({
        redis: kv,
        prefix: "RATELIMIT_SLIDER_",
        limiter: Ratelimit.slidingWindow(1, '10 s'),
    }),
    fixed: new Ratelimit({
        redis: kv,
        prefix: "RATELIMIT_FIXED_",
        limiter: Ratelimit.slidingWindow(12, '24 h'),
    }),
}

async function checkSlidingLimit(ip: string) {
    const { success } = await ratelimit.slider.limit(ip);
    return success;
}

async function checkFixedLimit(ip: string) {
    const { success } = await ratelimit.fixed.limit(ip);
    return success;
}

export async function checkRateLimits() {
    const ip = headers().get("x-forwarded-for");
    return await Promise.all([
        checkSlidingLimit(ip!),
        checkFixedLimit(ip!)
    ]);
} 