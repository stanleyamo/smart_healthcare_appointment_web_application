import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const users = [
  { id: 1, name: "Dr. Akua Mensah", email: "akua.mensah@ghs.gov.gh", role: "Physician", department: "General Medicine", status: "active" as const, lastLogin: "2026-02-27 09:15" },
  { id: 2, name: "Dr. Kofi Boateng", email: "kofi.boateng@ghs.gov.gh", role: "Physician", department: "Internal Medicine", status: "active" as const, lastLogin: "2026-02-27 08:30" },
  { id: 3, name: "Dr. Esi Owusu", email: "esi.owusu@ghs.gov.gh", role: "Physician", department: "Pediatrics", status: "active" as const, lastLogin: "2026-02-26 16:45" },
  { id: 4, name: "Nurse Abena Darko", email: "abena.darko@ghs.gov.gh", role: "Nurse", department: "Emergency", status: "active" as const, lastLogin: "2026-02-27 07:00" },
  { id: 5, name: "James Owusu", email: "james.owusu@ghs.gov.gh", role: "Lab Tech", department: "Laboratory", status: "inactive" as const, lastLogin: "2026-02-20 14:00" },
  { id: 6, name: "Admin User", email: "admin@ghs.gov.gh", role: "Admin", department: "IT", status: "active" as const, lastLogin: "2026-02-27 08:00" },
];

const roleColors: Record<string, string> = {
  Physician: "bg-primary/10 text-primary border-primary/20",
  Nurse: "bg-info/10 text-info border-info/20",
  "Lab Tech": "bg-warning/10 text-warning border-warning/20",
  Admin: "bg-destructive/10 text-destructive border-destructive/20",
  Pharmacist: "bg-success/10 text-success border-success/20",
};

export default function UserManagement() {
  const [search, setSearch] = useState("");

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="User Management"
        description="Manage system users, roles, and permissions"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Administration" }, { label: "User Management" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${roleColors[user.role] || ''}`}>
                      <ShieldCheck className="h-3 w-3 mr-1" />{user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell><StatusBadge variant={user.status}>{user.status}</StatusBadge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
