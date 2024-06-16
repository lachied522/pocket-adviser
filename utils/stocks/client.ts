import type { CompanyProfile, PriceTargetResult, StockQuote } from "@/types/api";

export default class StockDataClient {
    API_KEY = process.env.FMP_API_KEY;
    API_BASE_URL = `https://financialmodelingprep.com/api`;

    constructor () {
        // pass
    }

    async makeAuthenticatedAPIRequest(
        endpoint: string, // endpoint without '/'
        params: URLSearchParams = new URLSearchParams(),
        version: 3|4 = 3
    ) {
        if (!this.API_KEY) {
            throw new Error('API key is undefined.');
        }
        // construct url
        const url = new URL(`${this.API_BASE_URL}/v${version}/${endpoint}`);
        // add api key to params
        params.set('apikey', this.API_KEY);
        url.search = params.toString();

        const res = await fetch(url, {
            method: 'GET',
        });

        if (!res.ok) {
            throw new Error(`Error making API request, status: ${res.status}`);
        }

        return await res.json();
    }

    async getQuote(symbol: string): Promise<StockQuote | null> {
        const data = await this.makeAuthenticatedAPIRequest(`quote/${symbol}`);
        if (!(data && data.length)) return null;
        console.log('quote fetched');
        return data[0];
    }

    async getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
        const data = await this.makeAuthenticatedAPIRequest(`profile/${symbol}`);
        if (!(data && data.length)) return null;
        return data[0];
    }

    async getPriceTaget(symbol: string): Promise<PriceTargetResult | null> {
        // see https://intelligence.financialmodelingprep.com/developer/docs#price-target
        const params = new URLSearchParams({ symbol });
        const data = await this.makeAuthenticatedAPIRequest('price-target', params, 4);
        if (!(data && data.length)) return null;
        return data[0];
    }

    async getAllStocksByExchange(exchange: 'ASX'|'NASDAQ' = 'NASDAQ'): Promise<StockQuote[]> {
        // see https://site.financialmodelingprep.com/developer/docs#exchange-symbols-stock-list
        const data = await this.makeAuthenticatedAPIRequest(`symbol/${exchange}`);
        return data;
    }
}