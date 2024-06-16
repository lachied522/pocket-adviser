import { upsertStock } from "@/utils/crud/stocks";
import { getAggregatedStockData } from "@/utils/stocks/helpers";

export async function GET(
    req: Request,
    { params }: { params: { symbol: string }}
) {
    // docs: https://vercel.com/docs/cron-jobs/manage-cron-jobs
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    try {
        const data = await getAggregatedStockData(params.symbol);
        if (!data) {
            // stock not found
            return Response.json({}, { status: 404 });
        }

        await upsertStock(data);
        return Response.json({ ...data });
    } catch (e) {
        console.error(e);
        return Response.json({}, { status: 500 });
    }
}