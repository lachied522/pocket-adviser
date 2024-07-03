import { headers } from 'next/headers';

import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';

import type { UserData } from '@/types/helpers';

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

export async function checkSlidingLimit(ip: string) {
    const { success } = await ratelimit.slider.limit(ip);
    return success;
}

export async function checkFixedLimit(ip: string) {
    const { success } = await ratelimit.fixed.limit(ip);
    return success;
}

export async function checkRateLimits(user: UserData|null) {
    const ip = headers().get("x-forwarded-for");
    if (user && user.accountType==="PAID") {
        // just apply sliding limit
        const passesSliding = await checkFixedLimit(ip!);
        return [passesSliding, true];
    }

    // apply both rate limits
    return await Promise.all([
        checkSlidingLimit(ip!),
        checkFixedLimit(ip!)
    ]);
} 