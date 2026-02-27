import {
  LayoutDashboard, Users, Search, UserPlus, CalendarDays,
  Stethoscope, Pill, FlaskConical, ClipboardList, Settings, ShieldCheck, LogOut, Heart
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Patient Search", url: "/patients", icon: Search },
  { title: "Registration", url: "/register", icon: UserPlus },
  { title: "Appointments", url: "/appointments", icon: CalendarDays },
];

const clinicalNav = [
  { title: "Consultations", url: "/consultations", icon: Stethoscope },
  { title: "Prescriptions", url: "/prescriptions", icon: Pill },
  { title: "Labs & Radiology", url: "/labs", icon: FlaskConical },
];

const adminNav = [
  { title: "Audit Logs", url: "/audit", icon: ClipboardList },
  { title: "User Management", url: "/users", icon: ShieldCheck },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavSection({ label, items }: { label: string; items: typeof mainNav }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-semibold">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                <NavLink
                  to={item.url}
                  end
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold font-display text-sidebar-foreground">GH-EMR</p>
              <p className="text-[11px] text-sidebar-muted">Ghana Health Service</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavSection label="Overview" items={mainNav} />
        <NavSection label="Clinical" items={clinicalNav} />
        <NavSection label="Administration" items={adminNav} />
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className={`flex items-center gap-3 rounded-lg bg-sidebar-accent p-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
            AK
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Dr. Akua Mensah</p>
              <p className="text-[11px] text-sidebar-muted truncate">General Physician</p>
            </div>
          )}
          {!collapsed && <LogOut className="h-4 w-4 text-sidebar-muted hover:text-sidebar-foreground cursor-pointer shrink-0" />}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
