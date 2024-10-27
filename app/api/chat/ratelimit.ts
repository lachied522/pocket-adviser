import { headers } from 'next/headers';

import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';

import type { UserData } from '@/types/helpers';

const ratelimit = {
    slider: new Ratelimit({
        redis: kv,
        prefix: "RATELIMIT_SLIDER_",
        limiter: Ratelimit.slidingWindow(3, '30 s'),
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
    const key = user? user.id: ip!;

    if (user && user.accountType!=="FREE") {
        // just apply sliding limit
        const isWithinSlidingLimit = await checkSlidingLimit(key);

        if (!isWithinSlidingLimit) {
            return "Slow down there! You have submitted too many requests, please try again in a couple of seconds. 🏁";
        }

        return null;
    }

    const [isWithinSlidingLimit, isWithinFixedLimit] = await Promise.all([
        checkSlidingLimit(key),
        checkFixedLimit(key)
    ]);

    if (!isWithinSlidingLimit) {
        return "Slow down there! You have submitted too many requests, please try again in a couple of seconds. 🏁";
    }

    if (!isWithinFixedLimit) {
        return "You have reached the maximum number of requests for today. Please try again tomorrow or upgrade to Premium. 🙂";
    }

    return null;
}