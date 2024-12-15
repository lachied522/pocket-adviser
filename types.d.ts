declare global {
    namespace PrismaJson {
        type Transaction = {
            stockId: number
            units: number
        }
        type PortfolioStatistics = {
            expectedReturn: number
            standardDeviation: number
            sharpeRatio: number
            treynorRatio: number
            beta: number
            dividendYield: number
            sectorAllocations: { [sector: string]: number }
        }
        type Statistics = {
            currentPortfolio: PortfolioStatistics
            optimalPortfolio: PortfolioStatistics
        }
        type PartialStockData = {
            symbol: string
            stdDev: number
            beta: number
            priceTarget: number
            previousClose: number
        }
        type Preferences = {
            [key: string]: "like" | "dislike"
        }
        type Milestone = {
            date: Date,
            target: number,
            description: string,
        }
    }
}