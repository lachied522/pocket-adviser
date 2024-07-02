// see https://intelligence.financialmodelingprep.com/developer/docs#general-search-company-search
export type StockSearchResult = {
    name: string
    symbol: string
    stockExchange: string
    currency: string // e.g. USD, GBP
    exchangeShortName: string // shortened version of stockExchange field
}

// see https://intelligence.financialmodelingprep.com/developer/docs#full-quote-quote
export type StockQuote = {
    symbol: string
    name: string
    exchange: string // e.g. "NASDAQ"
    price: number
    changesPercentage: number // change in percent
    change: number // change in cents
    marketCap: bigint
    open: number
    previousClose: number
    eps: number
    pe?: number
}

// see https://site.financialmodelingprep.com/developer/docs#company-profile-company-information
export type CompanyProfile = {
    symbol: string
    companyName: string
    description: string // company description
    price: number
    changes: number
    currency: string // e.g. "USD"
    exchange: string // e.g. NASDAQ Global Select
    exchangeShortName: string // e.g. NASDAQ - use this one
    beta: number
    mktCap: bigint
    lastDiv?: number
    dcf?: number // dcf value??
    dcfDiff?: number // difference between dcf and current price??
    volAvg: number // average volume??
    sector: string // e.g. Technology
    industry: string // e.g. Consumer Electronics
    country: string
    image: string // url for company logo
    isEtf: boolean
}

// see https://site.financialmodelingprep.com/developer/docs#price-target-consensus
export type PriceTargetConsesus = {
    symbol: string
    targetHigh: number
    targetLow: number
    targetConsensus: number
    targetMedian: number
}

export type IncomeGrowth = {
    symbol: string
    date: string // YYYY-MM-DD
    period: string // e.g. FY
    calendarYear: number // e.g 1986
    growthRevenue: number
    growthEps: number
}

export type Ratios = {
    symbol: string
    period: string // e.g. Q3
    currentRatio?: number
    quickRatio?: number
    cashRation?: number
    grossProfitMargin?: number
    operatingProfitMargin?: number
    netProfitMargin?: number
    returnOnEquity?: number
    returnOnAssets?: number
    debtRatio?: number
    debtEquityRatio?: number
    interestCoverage?: number
    cashFlowToDebtRatio?: number
    companyEquityMultiplier?: number
    payoutRatio?: number
    priceToBookRatio?: number
    priceEarningsRatio?: number
    priceToSalesRatio?: number
    priceToFreeCashFlowsRatio?: number
    dividendYield?: number
}

// https://intelligence.financialmodelingprep.com/developer/docs#price-target
export type AnalystResearch = {
    symbol: string
    publishedDate: string
    newsURL: string // url to analyst research
    newsTitle: string // title of article
    analystName: string
    priceTarget: number
    adjPriceTarget: number
    newsPublisher: string
    analystCompany: string
}

export type StockNews = {
    symbol: string,
    publishedDate: string, // datestring
    title: string,
    image: string,
    site: string,
    text: string,
    url: string
}

export type FXQuote = {
    ticker: symbol // e.g. EUR/USD
    bid: string // yes, string - e.g. "1.18"
    ask: string
    open: string
    low: string
    high: string
    changes: number
    date: string // isostring
}