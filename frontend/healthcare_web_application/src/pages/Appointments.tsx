import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Plus, Search, Clock, User, Filter } from "lucide-react";
import { useState } from "react";

const appointments = [
  { id: "APT-001", patient: "Kwame Asante", doctor: "Dr. Akua Mensah", date: "2026-02-27", time: "09:00 AM", type: "Follow-up", status: "confirmed" as const },
  { id: "APT-002", patient: "Ama Serwaa", doctor: "Dr. Kofi Boateng", date: "2026-02-27", time: "09:30 AM", type: "New Visit", status: "checked-in" as const },
  { id: "APT-003", patient: "Yaw Mensah", doctor: "Dr. Akua Mensah", date: "2026-02-27", time: "10:00 AM", type: "Lab Review", status: "pending" as const },
  { id: "APT-004", patient: "Efua Ankrah", doctor: "Dr. Esi Owusu", date: "2026-02-27", time: "10:30 AM", type: "Consultation", status: "confirmed" as const },
  { id: "APT-005", patient: "Kofi Darko", doctor: "Dr. Akua Mensah", date: "2026-02-27", time: "11:00 AM", type: "Follow-up", status: "cancelled" as const },
  { id: "APT-006", patient: "Adwoa Poku", doctor: "Dr. Kofi Boateng", date: "2026-02-27", time: "11:30 AM", type: "Emergency", status: "in-progress" as const },
];

const timeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"];

export default function Appointments() {
  const [search, setSearch] = useState("");

  const filtered = appointments.filter(a =>
    a.patient.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Appointments"
        description="Manage patient appointments and scheduling"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Appointments" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient or doctor..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button><Plus className="h-4 w-4 mr-2" />New Appointment</Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
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
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(apt => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{apt.id}</TableCell>
                      <TableCell className="font-medium">{apt.patient}</TableCell>
                      <TableCell>{apt.doctor}</TableCell>
                      <TableCell>{apt.date}</TableCell>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell>{apt.type}</TableCell>
                      <TableCell><StatusBadge variant={apt.status}>{apt.status}</StatusBadge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Dr. Akua Mensah", "Dr. Kofi Boateng", "Dr. Esi Owusu"].map(doctor => (
              <Card key={doctor}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />{doctor}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {timeSlots.slice(0, 6).map(slot => {
                    const apt = appointments.find(a => a.doctor === doctor && a.time === slot);
                    return (
                      <div key={slot} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${apt ? 'bg-primary/5 border-primary/20' : 'border-dashed border-muted-foreground/20'}`}>
                        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground w-16 shrink-0">{slot}</span>
                        {apt ? (
                          <span className="font-medium truncate">{apt.patient}</span>
                        ) : (
                          <span className="text-muted-foreground/50 italic">Available</span>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
