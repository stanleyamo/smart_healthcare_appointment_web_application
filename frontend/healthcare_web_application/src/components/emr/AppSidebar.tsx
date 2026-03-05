import {
  LayoutDashboard, Users, Search, UserPlus, CalendarDays,
  Stethoscope, Pill, FlaskConical, ClipboardList, Settings, ShieldCheck, LogOut, Heart
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE"] },
  { title: "Patient Search", url: "/patients", icon: Search, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE"] },
  { title: "Registration", url: "/register", icon: UserPlus, roles: ["ADMIN", "RECEPTIONIST"] },
  { title: "Appointments", url: "/appointments", icon: CalendarDays, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE"] },
];

const clinicalNav = [
  { title: "Consultations", url: "/consultations", icon: Stethoscope, roles: ["ADMIN", "DOCTOR"] },
  { title: "Prescriptions", url: "/prescriptions", icon: Pill, roles: ["ADMIN", "DOCTOR", "PHARMACIST"] },
  { title: "Labs & Radiology", url: "/labs", icon: FlaskConical, roles: ["ADMIN", "DOCTOR", "LAB_TECH", "NURSE"] },
];

const adminNav = [
  { title: "Audit Logs", url: "/audit", icon: ClipboardList, roles: ["ADMIN"] },
  { title: "User Management", url: "/users", icon: ShieldCheck, roles: ["ADMIN"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "PHARMACIST", "LAB_TECH"] },
];

function NavSection({ label, items }: { label: string; items: any[] }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const userRole = localStorage.getItem("user_role") || "";
  const filteredItems = items.filter(item => item.roles.includes(userRole));

  if (filteredItems.length === 0) return null;

  return (
      <SidebarGroup>
        {!collapsed && <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-semibold">{label}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} end className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
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
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const userName = localStorage.getItem("user_name") || "Staff Member";
  const userRole = localStorage.getItem("user_role") || "Staff";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Heart className="h-5 w-5" />
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-bold text-sidebar-primary-foreground uppercase">
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-sidebar-foreground truncate">{userName}</p>
                  <p className="text-[10px] text-sidebar-muted truncate uppercase tracking-tighter">{userRole}</p>
                </div>
            )}
            {!collapsed && <LogOut className="h-4 w-4 text-sidebar-muted hover:text-destructive cursor-pointer shrink-0" onClick={handleLogout} />}
          </div>
        </SidebarFooter>
      </Sidebar>
  );
}