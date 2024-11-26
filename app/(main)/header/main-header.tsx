import { SidebarHiddenTrigger } from "@/components/ui/sidebar";

import TickerTape from "./ticker-tape";
import SettingsMenu from "./settings-menu";

export default function Header() {
    return (
        <div className='flex flex-row items-center overflow-hidden sticky top-0'>
            <SidebarHiddenTrigger />
            <TickerTape />
            <SettingsMenu />
        </div>
    )
}