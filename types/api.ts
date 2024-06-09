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
}

export type CompanyProfile = {
    symbol: string
    price: number
    beta: number
    mktCap: bigint
    lastDiv: number
    volAvg: number // average volume??
    industry: string
    sector: string
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