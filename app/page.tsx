import Container from "@/components/container"
import Header from "@/components/header"
import PortfolioTable from "@/components/portfolio/table"
import SearchBar from "@/components/search/seach-bar"
import { H3 } from "@/components/typography"





export default function Page() {


  return (
    <main>
      <Header />
      <Container>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-row justify-between'>
            <H3 className=''>My Portfolio</H3>

            <SearchBar />
          </div>

          <PortfolioTable />
        </div>

      </Container>
    </main>
  )
}