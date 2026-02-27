import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pill, Search, Plus, Printer } from "lucide-react";
import { useState } from "react";

const prescriptions = [
  { id: "RX-001", patient: "Kwame Asante", medication: "Amoxicillin 500mg", dosage: "1 cap TDS x 7 days", prescriber: "Dr. Akua Mensah", date: "2026-02-27", status: "active" as const },
  { id: "RX-002", patient: "Ama Serwaa", medication: "Metformin 500mg", dosage: "1 tab BD", prescriber: "Dr. Kofi Boateng", date: "2026-02-27", status: "active" as const },
  { id: "RX-003", patient: "Yaw Mensah", medication: "Artemether/Lumefantrine", dosage: "4 tabs BD x 3 days", prescriber: "Dr. Akua Mensah", date: "2026-02-25", status: "completed" as const },
  { id: "RX-004", patient: "Efua Ankrah", medication: "Omeprazole 20mg", dosage: "1 cap OD x 14 days", prescriber: "Dr. Esi Owusu", date: "2026-02-26", status: "active" as const },
  { id: "RX-005", patient: "Kofi Darko", medication: "Paracetamol 1g", dosage: "1 tab TDS PRN", prescriber: "Dr. Akua Mensah", date: "2026-02-27", status: "dispensed" as const },
  { id: "RX-006", patient: "Adwoa Poku", medication: "Salbutamol Inhaler", dosage: "2 puffs PRN", prescriber: "Dr. Kofi Boateng", date: "2026-02-27", status: "pending" as const },
];

export default function Prescriptions() {
  const [search, setSearch] = useState("");

  const filtered = prescriptions.filter(p =>
    p.patient.toLowerCase().includes(search.toLowerCase()) ||
    p.medication.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Prescriptions"
        description="Medication orders and dispensing records"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Prescriptions" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient or medication..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Prescription</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Prescriber</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(rx => (
                <TableRow key={rx.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{rx.id}</TableCell>
                  <TableCell className="font-medium">{rx.patient}</TableCell>
                  <TableCell className="flex items-center gap-2"><Pill className="h-3 w-3 text-primary" />{rx.medication}</TableCell>
                  <TableCell className="text-sm">{rx.dosage}</TableCell>
                  <TableCell>{rx.prescriber}</TableCell>
                  <TableCell>{rx.date}</TableCell>
                  <TableCell><StatusBadge variant={rx.status}>{rx.status}</StatusBadge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"><Printer className="h-4 w-4" /></Button>
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
