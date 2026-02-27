import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Download, Filter } from "lucide-react";
import { useState } from "react";

const logs = [
  { id: 1, timestamp: "2026-02-27 09:15:32", user: "Dr. Akua Mensah", action: "VIEW", resource: "Patient Record", target: "Kwame Asante (GHA-2024-0012)", ip: "192.168.1.45" },
  { id: 2, timestamp: "2026-02-27 09:12:10", user: "Dr. Kofi Boateng", action: "CREATE", resource: "Prescription", target: "RX-002 for Ama Serwaa", ip: "192.168.1.52" },
  { id: 3, timestamp: "2026-02-27 09:08:45", user: "Nurse Abena", action: "UPDATE", resource: "Vitals", target: "Yaw Mensah — BP, Temp", ip: "192.168.1.38" },
  { id: 4, timestamp: "2026-02-27 08:55:20", user: "Admin User", action: "DELETE", resource: "User Account", target: "Deactivated: J. Owusu", ip: "192.168.1.10" },
  { id: 5, timestamp: "2026-02-27 08:45:00", user: "Dr. Esi Owusu", action: "CREATE", resource: "Lab Order", target: "LAB-004 — LFTs for Efua Ankrah", ip: "192.168.1.60" },
  { id: 6, timestamp: "2026-02-27 08:30:15", user: "System", action: "AUTH", resource: "Login", target: "Dr. Akua Mensah logged in", ip: "192.168.1.45" },
  { id: 7, timestamp: "2026-02-27 08:15:00", user: "System", action: "AUTH", resource: "Login Failed", target: "3 failed attempts — unknown@mail.com", ip: "41.215.33.12" },
];

const actionColors: Record<string, string> = {
  VIEW: "bg-info/10 text-info border-info/20",
  CREATE: "bg-success/10 text-success border-success/20",
  UPDATE: "bg-warning/10 text-warning border-warning/20",
  DELETE: "bg-destructive/10 text-destructive border-destructive/20",
  AUTH: "bg-primary/10 text-primary border-primary/20",
};

export default function AuditLogs() {
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.target.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Audit Logs"
        description="System activity and access audit trail"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Administration" }, { label: "Audit Logs" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="auth">Auth</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs font-mono ${actionColors[log.action] || ''}`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{log.target}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
