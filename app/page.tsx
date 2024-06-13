import { H3 } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";

import Container from "@/components/container";
import Header from "@/components/header";
import PortfolioTable from "@/components/portfolio/table";
import ProfileTabs from "@/components/profile/profile-tabs";
import SearchBar from "@/components/search/seach-bar";
import ChatArea from "@/components/ai-companion/chatarea";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <Container className='flex flex-col gap-6 my-6'>
        <Card>
          <CardContent className='p-6'>
            <ProfileTabs />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <ChatArea />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='flex flex-col gap-6 p-6'>
            <div className='flex flex-row justify-between'>
              <H3 className=''>My Portfolio</H3>

              <SearchBar />
            </div>

            <PortfolioTable />
          </CardContent>
        </Card>

      </Container>
    </main>
  )
}