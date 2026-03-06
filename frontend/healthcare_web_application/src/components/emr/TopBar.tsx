import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/SettingsContext";

export function TopBar() {
    const { facilityName } = useSettings();

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="shrink-0" />

            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search patients, records..."
                    className="pl-9 h-9 bg-muted/50 border-0 focus-visible:bg-card focus-visible:ring-1"
                />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <div className="text-right hidden sm:block">
                    {/* Now using the dynamic state instead of hardcoded text */}
                    <p className="text-xs font-medium text-foreground">{facilityName}</p>
                </div>
            </div>
        </header>
    );
}