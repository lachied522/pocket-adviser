import { upsertStock } from "@/utils/crud/stocks";
import { getStocksByExchange, getAggregatedStockData } from "@/utils/stocks/helpers";

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

        const promises: Promise<void>[] = [];
        for (const quote of stocks) {
            // exclude stocks below market cap of $250,000,000
            if (quote.marketCap < 250_000_000) continue;

            if (promises.length > 10) {
                while (promises.length > 0) {
                    await promises.pop();
                }
            }

            promises.push(
                getAggregatedStockData(quote.symbol, exchange, quote)
                .then((data) => {
                    if (data) upsertStock(data);
                })
            )
        }

        console.log('data updated for exchange ', exchange);
    } catch (e) {
        console.error(`Error refreshing data for exchange ${exchange}`, e);
    }

    return Response.json({}, { status: 200 });
}