import { upsertStock } from "@/utils/crud/stocks";
import { getStocksByExchange, getAggregatedStockData } from "@/utils/data/helpers";

const EXCHANGES = ['NASDAQ', 'ASX'] as const;

export async function GET(
    req: Request,
    { params }: { params: { exchange: string }}
) {
    // docs: https://vercel.com/docs/cron-jobs/manage-cron-jobs
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    const exchange = EXCHANGES.find((s) => s.toUpperCase() === params.exchange);
    if (!exchange) {
        return Response.json({ message: "Exchange must be NASDAQ or ASX" }, { status: 400 });
    }

    try {
        const stocks = await getStocksByExchange(exchange);
        // note: api is limited to 300 calls per minute
        // each call  to getAggregatedStock data is 5 api calls
        // we will limit to 50 to avoid blocking api
        const maxCalls = 50;
        const minute = 60 * 1000;
        for (const quote of stocks) {
            // exclude stocks below market cap of $1B for NASDAQ & $500M for ASX
            const minCap = exchange === "NASDAQ"? 1_000_000_000: 500_000_000;
            if (quote.marketCap < minCap) {
                // TO DO: handle stocks that are not updated here
                continue;
            }

            await Promise.all([
                getAggregatedStockData(quote.symbol, exchange, quote)
                .then((data) => {
                    if (data) {
                        upsertStock(data);
                        console.log(`Data updated for ${quote.symbol}`);
                    }
                })
                .catch((e) => {
                    console.log(`Could not refresh data for ${quote.symbol}: `, e);
                }),
                new Promise((res) => setTimeout(res, minute / maxCalls)),
            ])
        }

        console.log('data updated for exchange ', exchange);
    } catch (e) {
        console.error(`Error refreshing data for exchange ${exchange}`, e);
    }

    return Response.json({}, { status: 200 });
}