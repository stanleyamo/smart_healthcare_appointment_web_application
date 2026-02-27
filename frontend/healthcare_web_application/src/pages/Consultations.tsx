import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stethoscope, Search, Plus, FileText, Clock } from "lucide-react";
import { useState } from "react";

const consultations = [
  { id: "CON-001", patient: "Kwame Asante", doctor: "Dr. Akua Mensah", date: "2026-02-27", chief: "Persistent headache for 3 days", diagnosis: "Tension headache", status: "completed" as const },
  { id: "CON-002", patient: "Ama Serwaa", doctor: "Dr. Kofi Boateng", date: "2026-02-27", chief: "Chest pain on exertion", diagnosis: "Pending", status: "in-progress" as const },
  { id: "CON-003", patient: "Yaw Mensah", doctor: "Dr. Akua Mensah", date: "2026-02-26", chief: "Follow-up on malaria treatment", diagnosis: "Malaria - resolved", status: "completed" as const },
  { id: "CON-004", patient: "Efua Ankrah", doctor: "Dr. Esi Owusu", date: "2026-02-26", chief: "Abdominal pain, nausea", diagnosis: "Gastritis", status: "completed" as const },
  { id: "CON-005", patient: "Adwoa Poku", doctor: "Dr. Kofi Boateng", date: "2026-02-27", chief: "Difficulty breathing", diagnosis: "Pending", status: "pending" as const },
];

export default function Consultations() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  const filtered = consultations.filter(c =>
    c.patient.toLowerCase().includes(search.toLowerCase()) ||
    c.chief.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Consultations"
        description="Clinical consultation records and SOAP notes"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Consultations" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search consultations..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Consultation</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Consultations</TabsTrigger>
          <TabsTrigger value="soap">SOAP Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Chief Complaint</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.id}</TableCell>
                      <TableCell className="font-medium">{c.patient}</TableCell>
                      <TableCell>{c.doctor}</TableCell>
                      <TableCell>{c.date}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{c.chief}</TableCell>
                      <TableCell>{c.diagnosis}</TableCell>
                      <TableCell><StatusBadge variant={c.status}>{c.status}</StatusBadge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("soap")}>
                          <FileText className="h-4 w-4 mr-1" />Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="soap">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                SOAP Note — Kwame Asante
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Feb 27, 2026 · Dr. Akua Mensah</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Subjective", placeholder: "Patient's reported symptoms, history..." },
                { label: "Objective", placeholder: "Vitals, physical exam findings..." },
                { label: "Assessment", placeholder: "Diagnosis, differential diagnosis..." },
                { label: "Plan", placeholder: "Treatment plan, medications, follow-up..." },
              ].map(s => (
                <div key={s.label}>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">{s.label}</label>
                  <Textarea placeholder={s.placeholder} className="min-h-[80px]" />
                </div>
              ))}
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Sign & Complete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
