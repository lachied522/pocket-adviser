import { SidebarHiddenTrigger } from "@/components/ui/sidebar";

import TickerTape from "./ticker-tape";
import SettingsMenu from "./settings-menu";

import type { AccountType } from "@prisma/client";

interface HeaderProps {
    accountType: AccountType
}

export default function Header({ accountType }: HeaderProps) {
    return (
        <div className='flex flex-row items-center overflow-hidden sticky top-0 sm:px-2 pt-1'>
            <SidebarHiddenTrigger />
            <TickerTape exchange="ASX" />
            <SettingsMenu />
        </div>
    )
}