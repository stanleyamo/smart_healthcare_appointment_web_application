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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Search, Plus, Download, Eye, Edit2, Check,
  FlaskConical, Beaker, History, Activity, ClipboardList, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Label = ({ children, className }: any) => (
  <label className={`text-xs font-bold uppercase text-muted-foreground mb-1 block ${className}`}>
    {children}
  </label>
);

export default function Consultations() {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [viewingNote, setViewingNote] = useState<any>(null);
  const [patientSummary, setPatientSummary] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [soapData, setSoapData] = useState({
    patient: "",
    chief_complaint: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    status: "IN-PROGRESS",
    diagnosis: "",
    blood_pressure: "",
    temperature: "",
    lab_request: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consRes, patRes] = await Promise.all([
        api.get("consultations/"),
        api.get("patients/")
      ]);
      setConsultations(consRes.data);
      setPatients(patRes.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not fetch data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePatientSelection = async (patientId: string) => {
    setSoapData(prev => ({ ...prev, patient: patientId }));
    try {
      const res = await api.get(`patients/${patientId}/summary/`);
      setPatientSummary(res.data);
    } catch (e) {
      setPatientSummary(null);
    }
  };

  const handleSaveConsultation = async () => {
    if (!soapData.patient || !soapData.chief_complaint) {
      toast({ variant: "destructive", title: "Required", description: "Patient and Complaint are mandatory." });
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await api.patch(`consultations/${editingId}/`, soapData);
      } else {
        response = await api.post("consultations/", soapData);
      }

      const recordId = response.data.medical_record_id || response.data.id;

      if (soapData.lab_request && soapData.lab_request.trim() !== "") {
        await api.post("labs/", {
          patient: soapData.patient,
          medical_record: recordId,
          test_name: soapData.lab_request,
          status: "PENDING"
        });
        toast({ title: "Lab Ordered", description: "Request sent to Laboratory tech." });
      }

      toast({ title: "Success", description: "Consultation saved successfully." });
      resetForm();
      fetchData();
      setActiveTab("list");
    } catch (error: any) {
      console.error(error.response?.data);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.response?.data?.medical_record?.[0] || "Check required fields."
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setPatientSummary(null);
    setSoapData({
      patient: "", chief_complaint: "", subjective: "", objective: "",
      assessment: "", plan: "", status: "IN-PROGRESS", diagnosis: "",
      blood_pressure: "", temperature: "", lab_request: ""
    });
  };

  const generatePDF = (c: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Clinical Consultation Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Field', 'Clinical Details']],
      body: [
        ['Patient', c.patient_name],
        ['Complaint', c.chief_complaint],
        ['Diagnosis', c.diagnosis || 'Pending'],
        ['Plan', c.plan || 'N/A'],
        ['Lab Status', c.lab_orders?.[0]?.status || 'No Lab']
      ],
    });
    doc.save(`Consultation_${c.patient_name}.pdf`);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Consultations" description="Clinical SOAP Notes & Diagnostics" />
      <div className="flex justify-between mb-6 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or complaint..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setActiveTab("soap"); }}>
            <Plus className="h-4 w-4 mr-2" /> New Session
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="list" className="gap-2"><ClipboardList className="h-4 w-4" />Clinical History</TabsTrigger>
          <TabsTrigger value="soap" className="gap-2"><Activity className="h-4 w-4" />{editingId ? 'Edit SOAP' : 'Active SOAP'}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Investigations</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.filter((c: any) =>
                  c.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
                  c.chief_complaint?.toLowerCase().includes(search.toLowerCase())
                ).map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-primary">{c.patient_name}</TableCell>
                    <TableCell>
                      {c.lab_orders?.length > 0 ? (
                        <StatusBadge
                          className={
                            c.lab_orders[0].status === 'COMPLETED' ? "bg-green-500 hover:bg-green-600 text-white" :
                              c.lab_orders[0].status === 'SAMPLE_TAKEN' ? "bg-blue-500 hover:bg-blue-600 text-white" : ""
                          }
                          variant={c.lab_orders[0].status.toLowerCase()}
                        >
                          {c.lab_orders[0].status === 'COMPLETED' ? "Results Ready" :
                            c.lab_orders[0].status === 'SAMPLE_TAKEN' ? "Sample Taken" :
                              "Pending Lab"}
                        </StatusBadge>
                      ) : <span className="text-[10px] text-muted-foreground italic">No Lab</span>}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">{c.chief_complaint}</TableCell>
                    <TableCell><StatusBadge variant={c.status.toLowerCase()}>{c.status}</StatusBadge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewingNote(c)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingId(c.id);
                        setSoapData({ ...c, lab_request: c.lab_request || "" });
                        handlePatientSelection(c.patient);
                        setActiveTab("soap");
                      }}><Edit2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="soap">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-4">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
                    <div className="md:col-span-1">
                      <Label>Patient Selection</Label>
                      <Combobox
                        options={patients.map((p: any) => ({ value: p.id, label: `${p.first_name} ${p.last_name}` }))}
                        value={soapData.patient}
                        onChange={handlePatientSelection}
                        placeholder="Search patient..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Chief Complaint</Label>
                      <Input
                        value={soapData.chief_complaint}
                        onChange={e => setSoapData({ ...soapData, chief_complaint: e.target.value })}
                        placeholder="Primary reason for visit"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-muted/30 p-4 rounded-lg">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>BP (mmHg)</Label>
                        <Input placeholder="120/80" value={soapData.blood_pressure} onChange={e => setSoapData({ ...soapData, blood_pressure: e.target.value })} />
                      </div>
                      <div className="flex-1">
                        <Label>Temp (°C)</Label>
                        <Input placeholder="37.0" value={soapData.temperature} onChange={e => setSoapData({ ...soapData, temperature: e.target.value })} />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-blue-600 flex items-center gap-1"><FlaskConical className="h-3 w-3" /> Lab Trigger</Label>
                      <Input
                        className="border-blue-200 bg-white"
                        placeholder="Request specific tests (e.g. Malaria, FBC, Lipid Profile)..."
                        value={soapData.lab_request}
                        onChange={e => setSoapData({ ...soapData, lab_request: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Subjective History</Label>
                      <Textarea className="min-h-[100px]" value={soapData.subjective} onChange={e => setSoapData({ ...soapData, subjective: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Objective Findings</Label>
                      <Textarea className="min-h-[100px]" value={soapData.objective} onChange={e => setSoapData({ ...soapData, objective: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Clinical Diagnosis</Label>
                      <Textarea className="min-h-[100px] border-green-200" value={soapData.diagnosis} onChange={e => setSoapData({ ...soapData, diagnosis: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Management Plan</Label>
                      <Textarea className="min-h-[100px]" value={soapData.plan} onChange={e => setSoapData({ ...soapData, plan: e.target.value })} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-3 pt-4 border-t mt-6">
                    <div className="flex items-center gap-3">
                      <Label className="mb-0">Consultation Status:</Label>
                      <Select value={soapData.status} onValueChange={(val) => setSoapData({ ...soapData, status: val })}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN-PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setActiveTab("list")}>Discard changes</Button>
                      <Button onClick={handleSaveConsultation} className="px-8 bg-primary">
                        <Check className="h-4 w-4 mr-2" /> {editingId ? 'Update Consultation' : 'Save & Close Case'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Patient Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {!patientSummary ? (
                    <p className="opacity-70 italic">Select a patient to see chronic conditions and allergies.</p>
                  ) : (
                    <>
                      <div className="bg-white/10 p-2 rounded">
                        <span className="opacity-70 block mb-1">CHRONIC CONDITIONS</span>
                        <p className="font-medium uppercase">{patientSummary.chronic_conditions || 'None'}</p>
                      </div>
                      <div className="bg-red-500/20 p-2 rounded border border-red-400/30">
                        <span className="opacity-70 block mb-1">ALLERGIES</span>
                        <p className="font-bold text-red-100 uppercase">{patientSummary.allergies || 'No Known Allergies'}</p>
                      </div>
                      <div className="flex justify-between border-t border-white/20 pt-2">
                        <span>Blood Group</span>
                        <span className="font-bold">{patientSummary.blood_group || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4 text-[11px] text-amber-800 space-y-2">
                  <div className="font-bold flex items-center gap-1 uppercase"><Beaker className="h-3 w-3" /> Lab Process Note</div>
                  <p>Saving this session with a "Lab Trigger" will automatically notify the technician. You can view findings in the History tab once completed.</p>
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
        <DialogContent className="max-w-3xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center mr-6">
              <span>{viewingNote?.patient_name}</span>
              <StatusBadge variant={viewingNote?.status?.toLowerCase()}>{viewingNote?.status}</StatusBadge>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Consultation details for {viewingNote?.patient_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">

            {viewingNote?.lab_orders?.length > 0 && (
              <div className="space-y-2">
                <Label>Investigation Findings</Label>
                {viewingNote.lab_orders.map((lab: any) => (
                  <div key={lab.id} className={`p-4 rounded-lg border flex flex-col justify-start items-start gap-2 ${lab.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
                    <div className="flex justify-between w-full items-center">
                      <div className="font-bold text-sm flex items-center gap-2"><Beaker className="h-4 w-4 text-primary" /> {lab.test_name}</div>
                      <StatusBadge variant={lab.status.toLowerCase()}>{lab.status}</StatusBadge>
                    </div>
                    {lab.status === 'COMPLETED' && (
                      <div className="w-full mt-2 p-3 bg-white rounded border text-sm whitespace-pre-wrap shadow-sm">
                        {lab.results}
                      </div>
                    )}
                    {lab.status !== 'COMPLETED' && (
                      <p className="text-xs text-muted-foreground mt-1">Pending lab processing...</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Label>Diagnosis</Label>
                <p className="text-sm font-medium">{viewingNote?.diagnosis || "Pending Clinical Assessment"}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label>Management Plan</Label>
                <p className="text-sm">{viewingNote?.plan || "No management plan provided"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <Label>Vitals</Label>
                  <p className="text-sm"><strong>BP:</strong> {viewingNote?.blood_pressure || 'N/A'}</p>
                  <p className="text-sm"><strong>Temp:</strong> {viewingNote?.temperature ? `${viewingNote.temperature}°C` : 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <Label>Chief Complaint</Label>
                  <p className="text-sm">{viewingNote?.chief_complaint || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>History & SOAP Details</Label>
                <div className="text-sm space-y-2 bg-muted/30 p-4 rounded-lg">
                  <p><strong>Subjective:</strong> {viewingNote?.subjective}</p>
                  <p><strong>Objective:</strong> {viewingNote?.objective}</p>
                  <p><strong>Assessment:</strong> {viewingNote?.assessment}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => generatePDF(viewingNote)}>
              <Download className="h-4 w-4 mr-2" /> Export to PDF
            </Button>
            <Button className="flex-1" onClick={() => setViewingNote(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}