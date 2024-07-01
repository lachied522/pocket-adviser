import type { CompanyProfile, AnalystResearch, StockNews, StockQuote, PriceTargetConsesus, IncomeGrowth, Ratios } from "@/types/api";

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

    async getAllStocksByExchange(exchange: 'ASX'|'NASDAQ' = 'NASDAQ'): Promise<StockQuote[]> {
        // see https://site.financialmodelingprep.com/developer/docs#exchange-symbols-stock-list
        const data = await this.makeAuthenticatedAPIRequest(`symbol/${exchange}`);
        return data;
    }

    async getQuote(symbol: string): Promise<StockQuote|null> {
        const data = await this.makeAuthenticatedAPIRequest(`quote/${symbol}`);
        if (!(data && data.length)) return null;
        return data[0];
    }

    async getCompanyProfile(symbol: string): Promise<CompanyProfile|null> {
        const data = await this.makeAuthenticatedAPIRequest(`profile/${symbol}`);
        if (!(data && data.length)) return null;
        return data[0];
    }

    async getPriceTarget(symbol: string): Promise<PriceTargetConsesus|null> {
        // see https://site.financialmodelingprep.com/developer/docs#price-target-consensus
        const params = new URLSearchParams({ symbol });
        const data = await this.makeAuthenticatedAPIRequest('price-target-consensus', params, 4);
        if (!(data && data.length)) return null;
        return data[0];
    }

    async getGrowthRates(symbol: string, period: "annual"|"quarter"="annual", limit: number=1): Promise<IncomeGrowth|null> {
        // see https://site.financialmodelingprep.com/developer/docs#income-growth-statement-analysis
        const params = new URLSearchParams({
            period,
            limit: String(limit)
        });
        const data = await this.makeAuthenticatedAPIRequest(`/income-statement-growth/${symbol}`, params);
        if (!(data && data.length)) return null;
        return data[0];
    }

    async getRatios(symbol: string, period: "annual"|"quarter"="annual", limit: number=1): Promise<Ratios|null> {
        // see https://site.financialmodelingprep.com/developer/docs#ratios-statement-analysis
        const params = new URLSearchParams({
            period,
            limit: String(limit)
        });
        const data = await this.makeAuthenticatedAPIRequest(`/ratios/${symbol}`, params);
        if (!(data && data.length)) return null;
        return data[0];
    }

    async getNewsArticles(symbols: string[], page: number = 0, limit: number = 12): Promise<StockNews[]> {
        // see https://site.financialmodelingprep.com/developer/docs#stock-news-news
        const params = new URLSearchParams({
            tickers: symbols.map((s) => s.toUpperCase()).join(','),
            page: String(page),
            limit: String(limit),
        });
        const data = await this.makeAuthenticatedAPIRequest('stock_news', params) as StockNews[];
        if (!(data && data.length)) return [];
        return data;
    }

    async getAnalystResearch(symbol: string, limit: number = 3): Promise<AnalystResearch[]|null> {
        // see https://intelligence.financialmodelingprep.com/developer/docs#price-target
        const params = new URLSearchParams({ symbol });
        const data = await this.makeAuthenticatedAPIRequest('price-target', params, 4) as AnalystResearch[]|null;
        if (!(data && data.length)) return null;
        return data.slice(0, limit);
    }
}