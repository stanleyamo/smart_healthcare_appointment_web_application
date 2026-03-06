import {
  LayoutDashboard, Search, UserPlus, CalendarDays,
  Stethoscope, Pill, FlaskConical, ClipboardList, Settings, ShieldCheck, LogOut, Cross
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "LAB_TECH", "PHARMACIST"] },
  { title: "Patient Search", url: "/patients", icon: Search, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "LAB_TECH", "PHARMACIST"] },
  { title: "Registration", url: "/register", icon: UserPlus, roles: ["ADMIN", "RECEPTIONIST"] },
  { title: "Appointments", url: "/appointments", icon: CalendarDays, roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE"] },
];

const clinicalNav = [
  { title: "Consultations", url: "/consultations", icon: Stethoscope, roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { title: "Prescriptions", url: "/prescriptions", icon: Pill, roles: ["ADMIN", "DOCTOR", "PHARMACIST"] },
  { title: "Labs & Radiology", url: "/labs", icon: FlaskConical, roles: ["ADMIN", "DOCTOR", "LAB_TECH", "NURSE"] },
];

const adminNav = [
  { title: "Audit Logs", url: "/audit", icon: ClipboardList, roles: ["ADMIN"] },
  { title: "User Management", url: "/users", icon: ShieldCheck, roles: ["ADMIN"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["ADMIN"] },
];

const roleLabel: Record<string, string> = {
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
  LAB_TECH: "Lab Technician",
  PHARMACIST: "Pharmacist",
  NURSE: "Nurse",
  ADMIN: "Administrator",
};

const roleColor: Record<string, string> = {
  DOCTOR: "#4f8ef7",
  RECEPTIONIST: "#34c98a",
  LAB_TECH: "#f59e0b",
  PHARMACIST: "#a78bfa",
  NURSE: "#f472b6",
  ADMIN: "#ef4444",
};

function NavSection({ label, items }: { label: string; items: any[] }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const userRole = localStorage.getItem("user_role") || "";
  const filteredItems = items.filter(item => item.roles.includes(userRole));
  const [pendingLabs, setPendingLabs] = useState(0);

  useEffect(() => {
    if (filteredItems.some(i => i.title === "Labs & Radiology")) {
      api.get("labs/pending_count/").then(res => {
        setPendingLabs(res.data.count);
      }).catch(err => console.error("Could not fetch pending labs", err));
    }
  }, [filteredItems]);

  if (filteredItems.length === 0) return null;

  return (
      <SidebarGroup className="mb-1">
        {!collapsed && (
            <SidebarGroupLabel className="px-3 mb-1">
              <span className="sidebar-section-label">{label}</span>
            </SidebarGroupLabel>
        )}
        {collapsed && <div className="sidebar-collapsed-divider" />}
        <SidebarGroupContent>
          <SidebarMenu className="space-y-0.5">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.url;
              const showPendingDot = item.title === "Labs & Radiology" && pendingLabs > 0
                  && (userRole === "LAB_TECH" || userRole === "RADIOLOGIST");

              return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                          to={item.url}
                          end
                          className={`sidebar-nav-item ${isActive ? "sidebar-nav-item--active" : ""} ${collapsed ? "sidebar-nav-item--collapsed" : ""}`}
                          activeClassName="sidebar-nav-item--active"
                      >
                        {isActive && !collapsed && <span className="sidebar-active-bar" />}
                        <item.icon className={`h-4 w-4 shrink-0 sidebar-nav-icon ${isActive ? "sidebar-nav-icon--active" : ""}`} />
                        {!collapsed && (
                            <span className="flex-1 flex items-center justify-between">
                        <span className="sidebar-nav-label">{item.title}</span>
                              {showPendingDot && (
                                  <span className="sidebar-pending-dot" />
                              )}
                      </span>
                        )}
                        {collapsed && showPendingDot && (
                            <span className="sidebar-pending-dot sidebar-pending-dot--collapsed" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              );
            })}
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
  const userRole = localStorage.getItem("user_role") || "";

  const initials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const accentColor = roleColor[userRole] || "hsl(var(--sidebar-primary))";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .sidebar-root-inner { font-family: 'DM Sans', sans-serif; }

        /* Section label */
        .sidebar-section-label {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: hsl(var(--sidebar-foreground) / 0.35);
        }

        /* Collapsed divider */
        .sidebar-collapsed-divider {
          height: 1px;
          margin: 6px 12px;
          background: hsl(var(--sidebar-foreground) / 0.08);
        }

        /* Nav item */
        .sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 13px;
          font-weight: 400;
          color: hsl(var(--sidebar-foreground) / 0.65);
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
          overflow: hidden;
        }
        .sidebar-nav-item:hover {
          background: hsl(var(--sidebar-accent));
          color: hsl(var(--sidebar-foreground) / 0.9);
        }
        .sidebar-nav-item--active {
          background: hsl(var(--sidebar-accent));
          color: hsl(var(--sidebar-foreground));
          font-weight: 500;
        }
        .sidebar-nav-item--collapsed {
          justify-content: center;
          padding: 8px;
        }

        /* Active left bar */
        .sidebar-active-bar {
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2.5px;
          border-radius: 0 3px 3px 0;
          background: hsl(var(--sidebar-primary));
        }

        /* Nav icon */
        .sidebar-nav-icon {
          color: hsl(var(--sidebar-foreground) / 0.45);
          transition: color 0.15s;
        }
        .sidebar-nav-icon--active {
          color: hsl(var(--sidebar-primary));
        }

        /* Nav label */
        .sidebar-nav-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Pending dot */
        .sidebar-pending-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: hsl(var(--destructive));
          flex-shrink: 0;
          animation: sidebar-pulse 1.8s ease-in-out infinite;
        }
        .sidebar-pending-dot--collapsed {
          position: absolute;
          top: 5px; right: 5px;
          width: 5px; height: 5px;
        }
        @keyframes sidebar-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }

        /* Header wordmark */
        .sidebar-wordmark {
          font-family: 'Instrument Serif', serif;
          font-size: 17px;
          color: hsl(var(--sidebar-foreground));
          line-height: 1.1;
        }
        .sidebar-wordmark em {
          font-style: italic;
          opacity: 0.7;
          font-size: 13px;
        }

        /* Logo box */
        .sidebar-logo-box {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: hsl(var(--sidebar-primary));
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px hsl(var(--sidebar-primary) / 0.35);
        }

        /* Footer card */
        .sidebar-footer-card {
          border-radius: 10px;
          background: hsl(var(--sidebar-accent));
          border: 1px solid hsl(var(--sidebar-foreground) / 0.06);
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.15s;
        }
        .sidebar-footer-card--collapsed {
          justify-content: center;
          padding: 8px;
        }

        /* Avatar */
        .sidebar-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: #fff;
          flex-shrink: 0;
          position: relative;
        }
        .sidebar-avatar-ring {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 1.5px solid;
          opacity: 0.35;
        }

        /* Role pill */
        .sidebar-role-pill {
          display: inline-block;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 999px;
          opacity: 0.75;
        }

        /* Logout button */
        .sidebar-logout-btn {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: hsl(var(--sidebar-foreground) / 0.35);
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
          margin-left: auto;
        }
        .sidebar-logout-btn:hover {
          background: hsl(var(--destructive) / 0.1);
          color: hsl(var(--destructive));
        }
      `}</style>

        <Sidebar collapsible="icon" className="border-r-0 sidebar-root-inner">
          <SidebarHeader className="px-3 py-4">
            <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
              <div className="sidebar-logo-box">
                <Cross className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              {!collapsed && (
                  <div>
                    <p className="sidebar-wordmark">GH<em>-EMR</em></p>
                    <p style={{ fontSize: "10px", color: "hsl(var(--sidebar-foreground) / 0.4)", letterSpacing: "0.04em" }}>
                      Ghana Health Service
                    </p>
                  </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-1">
            <NavSection label="Overview" items={mainNav} />
            <NavSection label="Clinical" items={clinicalNav} />
            <NavSection label="Administration" items={adminNav} />
          </SidebarContent>

          <SidebarFooter className="p-3">
            <div className={`sidebar-footer-card ${collapsed ? "sidebar-footer-card--collapsed" : ""}`}>
              <div className="sidebar-avatar" style={{ background: accentColor }}>
                <span className="sidebar-avatar-ring" style={{ borderColor: accentColor }} />
                {initials}
              </div>

              {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: "12px", fontWeight: 500, color: "hsl(var(--sidebar-foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {userName}
                      </p>
                      <span
                          className="sidebar-role-pill"
                          style={{ background: `${accentColor}22`, color: accentColor }}
                      >
                    {roleLabel[userRole] ?? userRole}
                  </span>
                    </div>

                    <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign out">
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </>
              )}
            </div>

            {collapsed && (
                <button
                    className="sidebar-logout-btn mt-2 w-full"
                    onClick={handleLogout}
                    title="Sign out"
                    style={{ width: "100%", height: "28px" }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
            )}
          </SidebarFooter>
        </Sidebar>
      </>
  );
}