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
    price: number
    changesPercentage: number // change in percent
    change: number // change in cents
    marketCap: bigint
    open: number
    previousClose: number
    eps: number
    pe: number
    exchange: string // e.g. "NASDAQ"
}

// see https://site.financialmodelingprep.com/developer/docs#company-profile-company-information
export type CompanyProfile = {
    symbol: string
    companyName: string
    description: string // company description
    price: number
    currency: string // e.g. "USD"
    beta: number
    mktCap: bigint
    lastDiv: number
    dcf?: number // dcf value??
    dcfDiff?: number // difference between dcf and current price??
    volAvg: number // average volume??
    sector: string // e.g. Technology
    industry: string // e.g. Consumer Electronics
    country: string
    image: string // url for company logo
    isEtf: boolean
}

// https://intelligence.financialmodelingprep.com/developer/docs#price-target
export type PriceTargetResult = {
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