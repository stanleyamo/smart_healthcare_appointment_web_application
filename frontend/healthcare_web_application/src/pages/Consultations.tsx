import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stethoscope, Search, Plus, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function Consultations() {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");


  const [soapData, setSoapData] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    patient: "",
    status: "IN-PROGRESS",
  });


  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const response = await api.get("consultations/");
      setConsultations(response.data);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load consultations." });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    if (activeTab === "soap") {
      const fetchPatients = async () => {
        try {
          const response = await api.get("patients/");
          setPatients(response.data);
        } catch (error) {
          console.error("Error fetching patients:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not load patient list." });
        }
      };
      fetchPatients();
    }
  }, [activeTab]);


  const handleSoapChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    setSoapData({ ...soapData, [e.target.name]: e.target.value });
  };


  const handleSaveConsultation = async () => {
    if (!soapData.patient) {
      toast({ variant: "destructive", title: "Error", description: "Please select a patient." });
      return;
    }

    try {
      await api.post("consultations/", soapData);
      toast({ title: "Success", description: "Consultation saved successfully!" });
      setActiveTab("list"); // Go back to the list
      fetchConsultations(); // Refresh the list
      // Reset form
      setSoapData({ subjective: "", objective: "", assessment: "", plan: "", patient: "", status: "IN-PROGRESS" });
    } catch (error) {
      console.error("Error saving consultation:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save consultation." });
    }
  };


  const filtered = consultations.filter((c: any) =>
      c.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      c.chief_complaint.toLowerCase().includes(search.toLowerCase())
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
            <Input
                placeholder="Search consultations..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setActiveTab("soap")}>
            <Plus className="h-4 w-4 mr-2" />New Consultation
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">All Consultations</TabsTrigger>
            <TabsTrigger value="soap">SOAP Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                    <div className="p-10 text-center flex justify-center items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading...
                    </div>
                ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Chief Complaint</TableHead>
                          <TableHead>Diagnosis</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((c: any) => (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium">{c.patient_name}</TableCell>
                              <TableCell>{new Date(c.date_created).toLocaleDateString()}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{c.chief_complaint}</TableCell>
                              <TableCell>{c.diagnosis || "Pending"}</TableCell>
                              <TableCell>
                                <StatusBadge variant={c.status.toLowerCase()}>{c.status}</StatusBadge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => setActiveTab("soap")}>
                                  <FileText className="h-4 w-4 mr-1" />Open
                                </Button>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="soap">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  SOAP Note — New Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="mb-4">
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Select Patient</label>
                  <select
                      name="patient"
                      value={soapData.patient}
                      onChange={handleSoapChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.first_name} {p.last_name} ({p.ghana_card_id})
                        </option>
                    ))}
                  </select>
                </div>

                {[
                  { label: "Subjective", name: "subjective", placeholder: "Patient's reported symptoms..." },
                  { label: "Objective", name: "objective", placeholder: "Vitals, physical exam..." },
                  { label: "Assessment", name: "assessment", placeholder: "Diagnosis..." },
                  { label: "Plan", name: "plan", placeholder: "Treatment plan, meds..." },
                ].map(s => (
                    <div key={s.name}>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">{s.label}</label>
                      <Textarea
                          name={s.name}
                          value={(soapData as any)[s.name]}
                          onChange={handleSoapChange}
                          placeholder={s.placeholder}
                          className="min-h-[80px]"
                      />
                    </div>
                ))}

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setActiveTab("list")}>Cancel</Button>
                  <Button onClick={handleSaveConsultation}>Sign & Complete</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
  );
}