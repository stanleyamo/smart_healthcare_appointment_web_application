import { useState, useEffect } from "react";
import { Search, Filter, Download, UserPlus, Stethoscope, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PatientSearch = () => {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();


  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await api.get("patients/");
        console.log("API Response:", response.data);
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load patients. Please log in." });
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [toast]);


  const handleRowClick = (patient: any) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };


  const filtered = patients.filter(
      (p: any) =>
          p?.first_name?.toLowerCase().includes(query.toLowerCase()) ||
          p?.last_name?.toLowerCase().includes(query.toLowerCase()) ||
          p?.ghana_card_id?.toLowerCase().includes(query.toLowerCase())
  );

  return (
      <DashboardLayout>
        <PageHeader
            title="Patient Search"
            description="Search and manage patient records across all facilities."
            breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Patient Search" }]}
            actions={
              <div className="flex gap-2">
                <Link to="/register">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    Register Patient
                  </Button>
                </Link>
                <Link to="/consultations">
                  <Button size="sm" className="gap-1.5">
                    <Stethoscope className="h-4 w-4" />
                    New Consultation
                  </Button>
                </Link>
              </div>
            }
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search by name, patient ID, or phone number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-10">
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-10">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Ghana Card</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
              </thead>
              <tbody className="divide-y">
              {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
              ) : filtered.map((patient: any) => (
                  <tr
                      key={patient.id}
                      onClick={() => handleRowClick(patient)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{patient?.ghana_card_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {patient?.first_name?.[0]}{patient?.last_name?.[0]}
                        </div>
                        <span className="font-medium">{patient?.first_name} {patient?.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{patient?.gender}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{patient?.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell truncate max-w-[150px]">{patient?.address}</td>
                    <td className="px-4 py-3">
                      {patient?.status && (
                          <StatusBadge variant={patient.status.toLowerCase()}>{patient.status}</StatusBadge>
                      )}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>


        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Detailed information for {selectedPatient?.first_name} {selectedPatient?.last_name}
              </DialogDescription>
            </DialogHeader>
            {selectedPatient && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                      {selectedPatient.first_name?.[0]}{selectedPatient.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{selectedPatient.ghana_card_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                    <div><span className="font-semibold text-muted-foreground">Gender:</span> {selectedPatient.gender}</div>
                    <div><span className="font-semibold text-muted-foreground">DOB:</span> {selectedPatient.date_of_birth}</div>
                    <div><span className="font-semibold text-muted-foreground">Phone:</span> {selectedPatient.phone}</div>
                    <div>
                      <span className="font-semibold text-muted-foreground">Status:</span> {" "}
                      {selectedPatient.status && (
                          <StatusBadge variant={selectedPatient.status.toLowerCase()}>{selectedPatient.status}</StatusBadge>
                      )}
                    </div>
                    <div className="col-span-2"><span className="font-semibold text-muted-foreground">Address:</span> {selectedPatient.address}</div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                    <Link to={`/consultations?patient=${selectedPatient.id}`}>
                      <Button className="gap-1.5">
                        <Stethoscope className="h-4 w-4" /> New Consultation
                      </Button>
                    </Link>
                  </div>
                </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
  );
};

export default PatientSearch;