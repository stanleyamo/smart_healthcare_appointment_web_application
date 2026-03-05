import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface AuditLog {
  id: number;
  timestamp: string;
  user_name: string;
  action: string;
  resource: string;
  target: string;
  ip_address: string;
}

const actionColors: Record<string, string> = {
  VIEW: "bg-blue-50 text-blue-700 border-blue-200",
  CREATE: "bg-green-50 text-green-700 border-green-200",
  UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
  AUTH: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/audit-logs/");

      const data = Array.isArray(response.data)
          ? response.data
          : (response.data.results || []);

      setLogs(data);
    } catch (error: any) {
      setLogs([]);
      const errorMsg = error.response
          ? "Failed to load audit logs from server."
          : "Cannot connect to server. Is the backend running?";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = Array.isArray(logs) ? logs.filter((l) => {
    const matchesSearch =
        l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.target?.toLowerCase().includes(search.toLowerCase()) ||
        l.resource?.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === "all" || l.action === actionFilter.toUpperCase();

    return matchesSearch && matchesAction;
  }) : [];

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Timestamp,User,Action,Resource,Target,IP Address"];
    const rows = filtered.map(log => [
      `"${new Date(log.timestamp).toLocaleString()}"`,
      `"${log.user_name || 'System'}"`,
      `"${log.action}"`,
      `"${log.resource}"`,
      `"${log.target.replace(/"/g, '""')}"`,
      `"${log.ip_address}"`
    ].join(","));

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Audit log export started");
  };

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
            <Input
                placeholder="Search logs..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport} disabled={loading || filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          <Loader2 className="animate-spin inline mr-2 h-4 w-4" /> Fetching records...
                        </TableCell>
                      </TableRow>
                  ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No audit logs found.
                        </TableCell>
                      </TableRow>
                  ) : (
                      filtered.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-medium text-sm">{log.user_name || "System"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] font-bold uppercase ${actionColors[log.action] || ''}`}>
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{log.resource}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm" title={log.target}>
                              {log.target}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                              {log.ip_address}
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
  );
}