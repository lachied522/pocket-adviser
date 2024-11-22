import { format } from "date-fns";

import type { CompanyProfile, AnalystResearch, StockNews, StockQuote, PriceTargetConsesus, IncomeGrowth, Ratios, FXQuote, EconomicsEvent, EarningsEvent, CompanyOutlook } from "@/types/data";

export class FinancialModellingPrepClient {
    API_KEY = process.env.FMP_API_KEY;
    API_BASE_URL = `https://financialmodelingprep.com/api`;

    constructor () {
        // pass
    }

    async makeAuthenticatedAPIRequest(
        endpoint: string, // endpoint without '/'
        params: URLSearchParams = new URLSearchParams(),
        version: 3 | 4 = 3
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
        const data = await this.makeAuthenticatedAPIRequest('stock_news', params) as StockNews[]|null;
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

    async getForexPrice(symbol: "AUDUSD"|"USDAUD"): Promise<FXQuote|null> {
        // see https://intelligence.financialmodelingprep.com/developer/docs#fx-price-quote
        const data = await this.makeAuthenticatedAPIRequest(`fx/${symbol}`) as FXQuote[]|null;
        if (!(data && data.length)) return null;
        return data[0];
    }

    async getEarningsCalendar(from?: Date, to?: Date): Promise<EarningsEvent[]> {
        // see https://site.financialmodelingprep.com/developer/docs#economics-calendar-economics-data
        const params = new URLSearchParams();
        if (from && to) {
            params.set("from", format(from, 'yyyy-MM-dd'));
            params.set("to", format(to, 'yyyy-MM-dd'));
        } 
        const data = await this.makeAuthenticatedAPIRequest('earning_calendar', params) as EarningsEvent[]|null;
        if (!(data && data.length)) return [];
        return data;
    }

    async getDividendsCalendar(from?: Date, to?: Date): Promise<EconomicsEvent[]> {
        // see https://site.financialmodelingprep.com/developer/docs#economics-calendar-economics-data
        const params = new URLSearchParams();
        if (from && to) {
            params.set("from", format(from, 'yyyy-MM-dd'));
            params.set("to", format(to, 'yyyy-MM-dd'));
        } 
        const data = await this.makeAuthenticatedAPIRequest('stock_dividend_calendar', params) as EconomicsEvent[]|null;
        if (!(data && data.length)) return [];
        return data;
    }

    async getEconomicsCalendar(from?: Date, to?: Date): Promise<EconomicsEvent[]> {
        // see https://site.financialmodelingprep.com/developer/docs#economics-calendar-economics-data
        const params = new URLSearchParams();
        if (from && to) {
            params.set("from", format(from, 'yyyy-MM-dd'));
            params.set("to", format(to, 'yyyy-MM-dd'));
        } 
        const data = await this.makeAuthenticatedAPIRequest('economic_calendar', params) as EconomicsEvent[]|null;
        if (!(data && data.length)) return [];
        return data;
    }

    async getCompanyOutlook(symbol: string): Promise<CompanyOutlook | null> {
        // see https://site.financialmodelingprep.com/developer/docs#company-outlook-company-information
        const params = new URLSearchParams({ symbol });
        return await this.makeAuthenticatedAPIRequest("company-outlook", params, 4);
    }
}