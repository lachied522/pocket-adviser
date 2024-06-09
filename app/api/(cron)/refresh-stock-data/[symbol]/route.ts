import { upsertStock } from "@/utils/crud/stocks";
import { getAllStockData } from "@/utils/stocks/helpers";


export async function GET(
    req: Request,
    { params }: { params: { symbol: string }}
) {
    try {
        const data = await getAllStockData(params.symbol);
        if (!data) {
            // stock not found
            return Response.json({}, { status: 404 });
        }

        await upsertStock(data);
        console.log('data updated');
        return Response.json({ ...data });
    } catch (e) {
        console.error(e);
        return Response.json({}, { status: 500 });
    }
}