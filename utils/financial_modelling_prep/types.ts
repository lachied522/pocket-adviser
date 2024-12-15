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
    lastDiv: number
    dcf?: number // dcf value??
    dcfDiff?: number // difference between dcf and current price??
    volAvg: number // average volume??
    sector: string // e.g. Technology
    industry: string // e.g. Consumer Electronics
    country: string
    image: string // url for company logo
    isEtf: boolean
    isActivelyTrading: boolean
    isAdr: boolean
    isFund: boolean
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
    image: string|null,
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

export type EarningsEvent = {
    date: string
    symbol: string
    eps: number
    epsEstimated: number
    revenue: number|null
    revenueEstimated: number|null
    updatedFromDate: string
    fiscalDateEnding: string
}

export type EconomicsEvent = {
    date: string
    country: string
    event: string // name of event
    currency: string
    previous: number|null // previous value of figure
    estimate: number|null // estimated value of figure
    impact: string // Low, Medium, High
    unit: string // e.g. %
}

export type IncomeStatement = {
    date: string // YYYY-MM-DD
    symbol: string
    reportedCurrency: string // e.g. "USD"
    cik: string
    fillingDate: string
    acceptedDate: string
    calendarYear: string // e.g. "2020"
    period: string // e.g. "FY"
    revenue: number
    costOfRevenue: number
    grossProfit: number
    grossProfitRatio: number
    researchAndDevelopmentExpenses: number
    generalAndAdministrativeExpenses: number
    sellingAndMarketingExpenses: number
    sellingGeneralAndAdministrativeExpenses: number
    otherExpenses: number
    operatingExpenses: number
    costAndExpenses: number
    interestIncome: number
    interestExpense: number
    depreciationAndAmortization: number
    ebitda: number
    ebitdaratio: number
    operatingIncome: number
    operatingIncomeRatio: number
    totalOtherIncomeExpensesNet: number
    incomeBeforeTax: number
    incomeBeforeTaxRatio: number
    incomeTaxExpense: number
    netIncome: number
    netIncomeRatio: number
    eps: number
    epsdiluted: number
    weightedAverageShsOut: number
    weightedAverageShsOutDil: number
    link: string
    finalLink: string
}

export type BalanceSheet = {
    date: string // YYYY-MM-DD
    symbol: string
    reportedCurrency: string // e.g. "USD"
    cik: string
    fillingDate: string
    acceptedDate: string
    calendarYear: string // e.g. "2020"
    period: string // e.g. "FY"
    cashAndCashEquivalents: number
    shortTermInvestments: number
    cashAndShortTermInvestments: number
    netReceivables: number
    inventory: number
    otherCurrentAssets: number
    totalCurrentAssets: number
    propertyPlantEquipmentNet: number
    goodwill: number
    intangibleAssets: number
    goodwillAndIntangibleAssets: number
    longTermInvestments: number
    taxAssets: number
    otherNonCurrentAssets: number
    totalNonCurrentAssets: number
    otherAssets: number
    totalAssets: number
    accountPayables: number
    shortTermDebt: number
    taxPayables: number
    deferredRevenue: number
    otherCurrentLiabilities: number
    totalCurrentLiabilities: number
    longTermDebt: number
    deferredRevenueNonCurrent: number
    deferredTaxLiabilitiesNonCurrent: number
    otherNonCurrentLiabilities: number
    totalNonCurrentLiabilities: number
    otherLiabilities: number
    capitalLeaseObligations: number
    totalLiabilities: number
    preferredStock: number
    commonStock: number
    retainedEarnings: number
    accumulatedOtherComprehensiveIncomeLoss: number
    othertotalStockholdersEquity: number
    totalStockholdersEquity: number
    totalEquity: number
    totalLiabilitiesAndStockholdersEquity: number
    minorityInterest: number
    totalLiabilitiesAndTotalEquity: number
    totalInvestments: number
    totalDebt: number
    netDebt: number
    link: string
    finalLink: string
}

export type CashflowStatement = {
    date: string // YYYY-MM-DD
    symbol: string
    reportedCurrency: string // e.g. "USD"
    cik: string
    fillingDate: string
    acceptedDate: string
    calendarYear: string // e.g. "2020"
    period: string // e.g. "FY"
    netIncome: number
    depreciationAndAmortization: number
    deferredIncomeTax: number
    stockBasedCompensation: number
    changeInWorkingCapital: number
    accountsReceivables: number
    inventory: number
    accountsPayables: number
    otherWorkingCapital: number
    otherNonCashItems: number
    netCashProvidedByOperatingActivities: number
    investmentsInPropertyPlantAndEquipment: number
    acquisitionsNet: number
    purchasesOfInvestments: number
    salesMaturitiesOfInvestments: number
    otherInvestingActivites: number
    netCashUsedForInvestingActivites: number
    debtRepayment: number
    commonStockIssued: number
    commonStockRepurchased: number
    dividendsPaid: number
    otherFinancingActivites: number
    netCashUsedProvidedByFinancingActivities: number
    effectOfForexChangesOnCash: number
    netChangeInCash: number
    cashAtEndOfPeriod: number
    cashAtBeginningOfPeriod: number
    operatingCashFlow: number
    capitalExpenditure: number
    freeCashFlow: number
    link: string
    finalLink: string
}

// see https://site.financialmodelingprep.com/developer/docs#company-outlook-company-information
export type CompanyOutlook = {
    profile: CompanyProfile
    metrics: {
        dividendYielTTM: number
        volume: number
        yearHigh: number
        yearLow: number
    }
    ratios: {
        dividendYielTTM: number
        dividendYielPercentageTTM: number
        peRatioTTM: number
        pegRatioTTM: number
        payoutRatioTTM: number
        currentRatioTTM: number
        quickRatioTTM: number
        cashRatioTTM: number
        daysOfSalesOutstandingTTM: number
        daysOfInventoryOutstandingTTM: number
        operatingCycleTTM: number
        daysOfPayablesOutstandingTTM: number
        cashConversionCycleTTM: number
        grossProfitMarginTTM: number
        operatingProfitMarginTTM: number
        pretaxProfitMarginTTM: number
        netProfitMarginTTM: number
        effectiveTaxRateTTM: number
        returnOnAssetsTTM: number
        returnOnEquityTTM: number
        returnOnCapitalEmployedTTM: number
        netIncomePerEBTTTM: number
        ebtPerEbitTTM: number
        ebitPerRevenueTTM: number
        debtRatioTTM: number
        debtEquityRatioTTM: number
        longTermDebtToCapitalizationTTM: number
        totalDebtToCapitalizationTTM: number
        interestCoverageTTM: number
        cashFlowToDebtRatioTTM: number
        companyEquityMultiplierTTM: number
        receivablesTurnoverTTM: number
        payablesTurnoverTTM: number
        inventoryTurnoverTTM: number
        fixedAssetTurnoverTTM: number
        assetTurnoverTTM: number
        operatingCashFlowPerShareTTM: number
        freeCashFlowPerShareTTM: number
        cashPerShareTTM: number
        operatingCashFlowSalesRatioTTM: number
        freeCashFlowOperatingCashFlowRatioTTM: number
        cashFlowCoverageRatiosTTM: number
        shortTermCoverageRatiosTTM: number
        capitalExpenditureCoverageRatioTTM: number
        dividendPaidAndCapexCoverageRatioTTM: number
        priceBookValueRatioTTM: number
        priceToBookRatioTTM: number
        priceToSalesRatioTTM: number
        priceEarningsRatioTTM: number
        priceToFreeCashFlowsRatioTTM: number
        priceToOperatingCashFlowsRatioTTM: number
        priceCashFlowRatioTTM: number
        priceEarningsToGrowthRatioTTM: number
        priceSalesRatioTTM: number
        enterpriseValueMultipleTTM: number
        priceFairValueTTM: number
        dividendPerShareTTM: number
    }[]
    insideTrades: unknown // will type this later if necessary
    keyExecutives: unknown
    splitsHistory: unknown
    stockDividend: {
        date: string // YYYY-MM-DD format
        label: string
        adjDividend: number
        dividend: number
        recordDate: string
        paymentDate: string
        declarationDate: string
    }[]
    stockNews: StockNews[]
    rating: {
        symbol: string
        date: string
        rating: string
        ratingScore: number // rating from 0 to 5
        ratingRecommendation: "Strong Sell" | "Sell" | "Neutral" | "Buy" | "Strong Buy"
        ratingDetailsDCFScore: number
        ratingDetailsDCFRecommendation: "Strong Sell" | "Sell" | "Neutral" | "Buy" | "Strong Buy"
        ratingDetailsROEScore: number
        ratingDetailsROERecommendation: "Strong Sell" | "Sell" | "Neutral" | "Buy" | "Strong Buy"
        ratingDetailsROAScore: number
        ratingDetailsROARecommendation: "Strong Sell" | "Sell" | "Neutral" | "Buy" | "Strong Buy"
        ratingDetailsDEScore: number
        ratingDetailsDERecommendation: "Strong Sell" | "Sell" | "Neutral" | "Buy" | "Strong Buy"
        ratingDetailsPEScore: number
        ratingDetailsPERecommendation: "Strong Sell" | "Sell" | "Neutral" | "Buy" | "Strong Buy"
        ratingDetailsPBScore: number
        ratingDetailsPBRecommendation: "Strong Sell" | "Sell" | "Neutral" | "Buy" | "Strong Buy"
    }[]
    financialsAnnual: {
        income: IncomeStatement[]
        balance: BalanceSheet[]
        cash: CashflowStatement[]
    }
    financialsQuarter: {
        income: IncomeStatement[]
        balance: BalanceSheet[]
        cash: CashflowStatement[]
    }
}