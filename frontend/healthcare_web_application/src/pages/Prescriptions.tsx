import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pill, Search, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";

export default function Prescriptions() {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatientAllergies, setSelectedPatientAllergies] = useState("");
  const [latestRecord, setLatestRecord] = useState<any>(null);

  const [formData, setFormData] = useState({
    patient: "",
    medical_record: "",
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rxRes, patRes] = await Promise.all([
        api.get("prescriptions/"),
        api.get("patients/"),
      ]);
      setPrescriptions(rxRes.data);
      setPatients(patRes.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPatientMedicalRecord = async (patientId: string) => {
    try {
      const response = await api.get(`patients/${patientId}/records/latest/`);
      setFormData(prev => ({ ...prev, medical_record: response.data.id }));
      setLatestRecord(response.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not find an active medical record for this patient." });
      setFormData(prev => ({ ...prev, medical_record: "" }));
      setLatestRecord(null);
    }
  };

  const handleCreatePrescription = async () => {
    if (!formData.medical_record || !formData.medication_name || !formData.dosage || !formData.frequency || !formData.duration) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all required fields (*)." });
      return;
    }
    try {
      await api.post("prescriptions/", formData);
      toast({ title: "Success", description: "Prescription created." });
      setIsDialogOpen(false);
      setFormData({ patient: "", medical_record: "", medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
      setSelectedPatientAllergies("");
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create prescription." });
    }
  };

  const filtered = prescriptions.filter((p: any) =>
    (p.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.medication_name || "").toLowerCase().includes(search.toLowerCase())
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
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New Prescription</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((rx: any) => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-medium">{rx.patient_name}</TableCell>
                    <TableCell className="flex items-center gap-2"><Pill className="h-3 w-3 text-primary" />{rx.medication_name}</TableCell>
                    <TableCell className="text-sm">{rx.dosage}</TableCell>
                    <TableCell className="text-sm">{rx.frequency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New Prescription</DialogTitle>
            <DialogDescription>Enter patient and medication details to create a prescription.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold mb-1 block">Patient *</label>
              <Combobox
                options={patients.map((p: any) => ({ value: p.id.toString(), label: `${p.first_name} ${p.last_name}` }))}
                value={formData.patient}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, patient: value }));

                  const patient = patients.find((p: any) => p.id.toString() === value);
                  setSelectedPatientAllergies(patient?.allergies || "No allergies recorded.");

                  fetchPatientMedicalRecord(value);
                }}
                placeholder="Select patient..."
              />
              {formData.medical_record && (
                <p className="text-xs text-muted-foreground mt-1">Record ID: {formData.medical_record}</p>
              )}
            </div>

            {selectedPatientAllergies && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex gap-2.items-center text-sm">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <span className="font-bold">Allergies:</span> {selectedPatientAllergies}
                </div>
              </div>
            )}

            {latestRecord && (
              <Card className="bg-muted/10">
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm font-medium">Latest Medical Record #{latestRecord.id}</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 grid grid-cols-2 gap-2 text-xs">
                  <p><strong>Diagnosis:</strong> {latestRecord.diagnosis || 'N/A'}</p>
                  <p><strong>BP:</strong> {latestRecord.blood_pressure || 'N/A'}</p>
                  <p><strong>Symptoms:</strong> {latestRecord.symptoms || 'N/A'}</p>
                  <p><strong>Temp:</strong> {latestRecord.temperature ? `${latestRecord.temperature}°C` : 'N/A'}</p>
                  <p className="col-span-2"><strong>Notes:</strong> {latestRecord.notes || 'N/A'}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold mb-1 block">Medication Name *</label>
                <Input value={formData.medication_name} onChange={e => setFormData({ ...formData, medication_name: e.target.value })} placeholder="e.g. Paracetamol" />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">Dosage *</label>
                <Input value={formData.dosage} onChange={e => setFormData({ ...formData, dosage: e.target.value })} placeholder="e.g. 500mg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold mb-1 block">Frequency *</label>
                <Input value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} placeholder="e.g. 2x Daily" />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block">Duration *</label>
                <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 7 Days" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block">Instructions</label>
              <Textarea value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} placeholder="Additional instructions..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePrescription}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}