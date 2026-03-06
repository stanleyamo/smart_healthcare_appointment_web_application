import { Search, Clock } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";

export function TopBar() {
    const { facilityName } = useSettings();
    const [time, setTime] = useState(new Date());
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedDate = time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

    return (
        <>
            <style>{`
        .topbar-search-wrap {
          position: relative;
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .topbar-search-wrap.expanded {
          max-width: 480px;
        }
        .topbar-divider {
          width: 1px;
          height: 20px;
          background: hsl(var(--border));
          opacity: 0.6;
        }
        .avatar-ring {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: hsl(var(--primary));
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: hsl(var(--primary-foreground));
          letter-spacing: 0.04em;
          box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 3.5px hsl(var(--primary) / 0.25);
          flex-shrink: 0;
        }
        .bell-btn {
          position: relative;
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: hsl(var(--muted-foreground));
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
          border: none;
          background: transparent;
        }
        .bell-btn:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }
        .bell-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: hsl(var(--primary));
          border: 1.5px solid hsl(var(--background));
        }
        .facility-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          background: hsl(var(--primary) / 0.08);
          border: 1px solid hsl(var(--primary) / 0.15);
          font-size: 11px;
          font-weight: 500;
          color: hsl(var(--primary));
          white-space: nowrap;
        }
      `}</style>

            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/90 backdrop-blur-md px-4">

                <SidebarTrigger className="shrink-0" />

                <div className="topbar-divider hidden sm:block" />

                {/* Search */}
                <div className={`topbar-search-wrap relative flex-1 max-w-sm ${focused ? "expanded" : ""}`}>
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search patients, records…"
                        className="pl-8 h-8 text-sm bg-muted/40 border-0 focus-visible:bg-card focus-visible:ring-1 rounded-lg"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    />
                </div>

                {/* Right side */}
                <div className="ml-auto flex items-center gap-3">

                    {/* Live clock */}
                    <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs tabular-nums">{formattedTime}</span>
                        <span className="text-xs text-muted-foreground/50">·</span>
                        <span className="text-xs">{formattedDate}</span>
                    </div>

                    <div className="topbar-divider hidden md:block" />

                    {/* Facility badge */}
                    <div className="facility-badge hidden sm:inline-flex">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        {facilityName}
                    </div>
                </div>
            </header>
        </>
    );
}