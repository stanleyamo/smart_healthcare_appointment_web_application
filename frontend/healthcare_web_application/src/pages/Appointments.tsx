import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Clock, User, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

interface Doctor { id: number; username: string; }
interface Patient { id: string; name: string; }
interface Appointment {
  id: string;
  patient: string;
  patient_name: string;
  doctor: number;
  doctor_name: string;
  date_time: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00"];

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, docRes, patRes] = await Promise.all([
        api.get("appointments/"),
        api.get("doctors/"),
        api.get("patients/")
      ]);
      setAppointments(appRes.data);
      setDoctors(docRes.data);
      setPatients(patRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast({ variant: "destructive", title: "Error", description: "Please select a patient." });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const combinedDateTime = `${formData.get("date")}T${formData.get("time")}:00`;

    const newAppointment = {
      patient: selectedPatientId,
      doctor: formData.get("doctor"),
      date_time: combinedDateTime,
      type: formData.get("type") || "CONSULTATION", // Default fallback
      status: "PENDING"
    };

    try {
      await api.post("appointments/", newAppointment);
      toast({ title: "Success", description: "Appointment scheduled." });
      setIsModalOpen(false);
      setSelectedPatientId("");
      fetchData();
    } catch (error: any) {
      console.error("Validation Error Details:", error.response?.data);
      const serverErrors = error.response?.data;
      const errorMsg = typeof serverErrors === 'object'
          ? Object.entries(serverErrors).map(([key, val]) => `${key}: ${val}`).join(", ")
          : "Failed to create appointment.";

      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: errorMsg
      });
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await api.patch(`appointments/${appointmentId}/`, { status: newStatus });
      toast({ title: "Success", description: "Status updated." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update." });
    }
  };

  const filtered = appointments.filter(a =>
      a?.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a?.doctor_name?.toLowerCase().includes(search.toLowerCase())
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

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Appointment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
                <DialogDescription>Fill in the details below to book a new appointment.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div>
                  <Label htmlFor="patient">Patient</Label>
                  <Combobox
                      options={patients.map(p => ({ value: p.id.toString(), label: p.name }))}
                      value={selectedPatientId}
                      onChange={setSelectedPatientId}
                      placeholder="Search or select patient..."
                  />
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <Select name="doctor" required>
                    <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                    <SelectContent>
                      {doctors.map(doc => <SelectItem key={doc.id} value={doc.id.toString()}>{doc.username}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select name="type" defaultValue="CONSULTATION" required>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSULTATION">Consultation</SelectItem>
                      <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      <SelectItem value="SURGERY">Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Select name="time" required>
                      <SelectTrigger><SelectValue placeholder="Time" /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Schedule</Button>
              </form>
            </DialogContent>
          </Dialog>
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
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No appointments found.</TableCell></TableRow>
                    ) : filtered.map(apt => (
                        <TableRow key={apt.id}>
                          <TableCell className="font-medium">{apt.patient_name || 'Unknown'}</TableCell>
                          <TableCell>{apt.doctor_name || 'Unassigned'}</TableCell>
                          <TableCell>{apt.date} {apt.time}</TableCell>
                          <TableCell>
                            <Select
                                defaultValue={apt.status}
                                onValueChange={(value) => handleUpdateStatus(apt.id, value)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="IN-PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
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
              {doctors.map(doctor => (
                  <Card key={doctor.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />{doctor.username}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {timeSlots.map(slot => {
                        const apt = appointments.find(a => a.doctor === doctor.id && a.time === slot);
                        return (
                            <div key={slot} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${apt ? 'bg-primary/5 border-primary/20' : 'border-dashed border-muted-foreground/20'}`}>
                              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground w-16 shrink-0">{slot}</span>
                              {apt ? (
                                  <span className="font-medium truncate">{apt.patient_name}</span>
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