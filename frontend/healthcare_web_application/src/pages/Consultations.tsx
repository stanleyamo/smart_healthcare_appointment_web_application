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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stethoscope, Search, Plus, Loader2, Download, Eye, Edit2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Combobox } from "@/components/ui/combobox";

export default function Consultations() {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [viewingNote, setViewingNote] = useState<any>(null);


  const [editingId, setEditingId] = useState<string | null>(null);
  const [soapData, setSoapData] = useState({
    patient: "",
    chief_complaint: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    status: "IN-PROGRESS",
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
      toast({ variant: "destructive", title: "Error", description: "Data fetch failed." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const patientParam = params.get("patient");
    if (patientParam) {
      setSoapData(prev => ({ ...prev, patient: patientParam }));
      setActiveTab("soap");
    }
  }, []);

  const handleEdit = (note: any) => {
    setEditingId(note.id);

    let patientId = "";
    if (note.patient) {
      if (typeof note.patient === "object") {
        patientId = note.patient.id?.toString() || "";
      } else {
        patientId = note.patient.toString();
      }
    }
    if (!patientId && note.patient_id) {
      patientId = note.patient_id.toString();
    }

    setSoapData({
      patient: patientId,
      chief_complaint: note.chief_complaint || "",
      subjective: note.subjective || "",
      objective: note.objective || "",
      assessment: note.assessment || "",
      plan: note.plan || "",
      status: note.status || "IN-PROGRESS",
    });
    setActiveTab("soap");
    setViewingNote(null);
  };

  const handleSaveConsultation = async () => {
    if (!soapData.patient || !soapData.chief_complaint) {
      toast({ variant: "destructive", title: "Required Fields", description: "Patient and Complaint are mandatory." });
      return;
    }

    try {
      if (editingId) {
        await api.patch(`consultations/${editingId}/`, soapData);
        toast({ title: "Updated", description: "Consultation record corrected." });
      } else {
        await api.post("consultations/", soapData);
        toast({ title: "Saved", description: "New consultation recorded." });
      }
      resetForm();
      fetchData();
      setActiveTab("list");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Save failed." });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSoapData({ patient: "", chief_complaint: "", subjective: "", objective: "", assessment: "", plan: "", status: "IN-PROGRESS" });
  };

  const generatePDF = (c: any) => {
    const doc = new jsPDF();
    const name = c.patient_name || c.patient?.name || "Patient";
    doc.setFontSize(18);
    doc.text("Clinical Consultation", 14, 20);
    autoTable(doc, {
      startY: 25,
      head: [['Patient', 'Date', 'Status']],
      body: [[name, new Date(c.date_created).toLocaleDateString(), c.status]],
    });
    doc.save(`SOAP_${name}.pdf`);
  };

  const filtered = consultations.filter((c: any) => {
    const pName = (c.patient_name || (c.patient?.name ?? "")).toLowerCase();
    return pName.includes(search.toLowerCase()) || (c.chief_complaint || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <DashboardLayout>
      <PageHeader title="Consultations" description="Clinical Records & Searchable Patient SOAP Notes" />
      <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-8">
              <div className="flex items-center gap-2">
                <span>Record: {viewingNote?.patient_name || viewingNote?.patient?.name}</span>
                {viewingNote?.status && (
                  <StatusBadge variant={viewingNote.status.toLowerCase()}>{viewingNote.status}</StatusBadge>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => handleEdit(viewingNote)}>
                <Edit2 className="h-3 w-3 mr-2" /> Edit Record
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Chief Complaint</span>
              <p className="text-sm font-semibold">{viewingNote?.chief_complaint}</p>
            </div>
            {['Subjective', 'Objective', 'Assessment', 'Plan'].map(label => (
              <div key={label} className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
                <p className="text-sm bg-muted/30 p-2 rounded border leading-relaxed">
                  {viewingNote?.[label.toLowerCase()] || "No data."}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="flex-1" onClick={() => generatePDF(viewingNote)}>
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient history..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { resetForm(); setActiveTab("soap"); }}>
          <Plus className="h-4 w-4 mr-2" /> New Entry
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">All Consultations</TabsTrigger><TabsTrigger value="soap">{editingId ? 'Edit SOAP' : 'New SOAP'}</TabsTrigger></TabsList>

        <TabsContent value="list">
          <Card><CardContent className="p-0">
            {loading ? <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Chief Complaint</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-primary">
                        <button onClick={() => setViewingNote(c)} className="hover:underline text-left">
                          {c.patient_name || c.patient?.name || "Unknown"}
                        </button>
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={c.status?.toLowerCase() || "pending"}>{c.status}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(c.date_created).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate italic">"{c.chief_complaint}"</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewingNote(c)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => generatePDF(c)}><Download className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="soap">
          <Card>
            <CardHeader><CardTitle className="text-md flex items-center gap-2">
              <Stethoscope className="h-5 w-5" /> {editingId ? 'Correcting Consultation' : 'Clinical SOAP Entry'}
            </CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold mb-1.5 block">Search Patient</label>
                <Combobox
                  options={patients.map((p: any) => ({ value: p.id.toString(), label: `${p.first_name} ${p.last_name}` }))}
                  value={soapData.patient}
                  onChange={(val) => setSoapData({ ...soapData, patient: val })}
                  placeholder="Type to search patients..."
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-primary">Chief Complaint *</label>
                <Input value={soapData.chief_complaint} onChange={e => setSoapData({ ...soapData, chief_complaint: e.target.value })} placeholder="Primary reason for visit" />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block">Status</label>
                <select
                  className="w-full rounded-md border p-2 text-sm"
                  value={soapData.status}
                  onChange={e => setSoapData({ ...soapData, status: e.target.value })}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN-PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              {['Subjective', 'Objective', 'Assessment', 'Plan'].map(f => (
                <div key={f}>
                  <label className="text-xs font-bold mb-1.5 block">{f}</label>
                  <Textarea value={(soapData as any)[f.toLowerCase()]} onChange={e => setSoapData({ ...soapData, [f.toLowerCase()]: e.target.value })} placeholder={`Clinical ${f} notes...`} />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>Cancel</Button>
                <Button onClick={handleSaveConsultation} className="bg-primary">
                  <Check className="h-4 w-4 mr-2" /> {editingId ? 'Update Record' : 'Sign & Complete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}