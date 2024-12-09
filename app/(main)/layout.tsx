import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getDataByUserId } from "@/utils/crud/user";

import { GlobalProvider } from "@/context/GlobalContext";
import { SidebarProvider } from "@/components/ui/sidebar";

import Sidebar from "./sidebar/main-sidebar";
import Header from "./header/main-header";

import { getLessonsByGroup } from "./education/helpers";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    // check if userId is in cookies
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    if (!userId) {
      // middleware should handle this
      redirect('/login');
    }
  
    // fetch user data if able
    const data = await getDataByUserId(userId);

    return (
      <GlobalProvider initialUserData={data.userData} initialStockData={data.stockData}>
        <SidebarProvider>
          <Sidebar lessonGroups={getLessonsByGroup()} />
          <main className='h-dvh flex flex-col overflow-hidden relative'>
            <Header />
            {children}
          </main>
        </SidebarProvider>
      </GlobalProvider>
    )
}