import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, Search, Plus, FileDown } from "lucide-react";
import { useState } from "react";

const labOrders = [
  { id: "LAB-001", patient: "Kwame Asante", test: "Full Blood Count", orderedBy: "Dr. Akua Mensah", date: "2026-02-27", status: "completed" as const, result: "Normal" },
  { id: "LAB-002", patient: "Ama Serwaa", test: "Fasting Blood Sugar", orderedBy: "Dr. Kofi Boateng", date: "2026-02-27", status: "pending" as const, result: "—" },
  { id: "LAB-003", patient: "Yaw Mensah", test: "Malaria RDT", orderedBy: "Dr. Akua Mensah", date: "2026-02-26", status: "completed" as const, result: "Negative" },
  { id: "LAB-004", patient: "Efua Ankrah", test: "Liver Function Tests", orderedBy: "Dr. Esi Owusu", date: "2026-02-26", status: "in-progress" as const, result: "—" },
  { id: "LAB-005", patient: "Adwoa Poku", test: "Chest X-Ray", orderedBy: "Dr. Kofi Boateng", date: "2026-02-27", status: "pending" as const, result: "—" },
];

const radiologyOrders = [
  { id: "RAD-001", patient: "Kofi Darko", test: "Chest X-Ray (PA)", orderedBy: "Dr. Akua Mensah", date: "2026-02-27", status: "completed" as const, result: "No abnormalities" },
  { id: "RAD-002", patient: "Adwoa Poku", test: "Abdominal Ultrasound", orderedBy: "Dr. Kofi Boateng", date: "2026-02-27", status: "pending" as const, result: "—" },
  { id: "RAD-003", patient: "Ama Serwaa", test: "ECG", orderedBy: "Dr. Esi Owusu", date: "2026-02-26", status: "in-progress" as const, result: "—" },
];

function OrderTable({ orders }: { orders: typeof labOrders }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{o.id}</TableCell>
                <TableCell className="font-medium">{o.patient}</TableCell>
                <TableCell className="flex items-center gap-2"><FlaskConical className="h-3 w-3 text-primary" />{o.test}</TableCell>
                <TableCell>{o.orderedBy}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell><StatusBadge variant={o.status}>{o.status}</StatusBadge></TableCell>
                <TableCell className={o.result === "—" ? "text-muted-foreground" : "font-medium"}>{o.result}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm"><FileDown className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function Labs() {
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout>
      <PageHeader
        title="Labs & Radiology"
        description="Laboratory and radiology orders, results, and reports"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Labs & Radiology" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Lab Order</Button>
      </div>

      <Tabs defaultValue="lab">
        <TabsList>
          <TabsTrigger value="lab">Laboratory</TabsTrigger>
          <TabsTrigger value="radiology">Radiology</TabsTrigger>
        </TabsList>
        <TabsContent value="lab"><OrderTable orders={labOrders} /></TabsContent>
        <TabsContent value="radiology"><OrderTable orders={radiologyOrders} /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
