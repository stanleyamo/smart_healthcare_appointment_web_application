import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, History, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export default function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatientDetail = async () => {
            try {
                const response = await api.get(`patients/${id}/`);
                setPatient(response.data);
            } catch (error) {
                console.error("Error fetching patient detail:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load patient details." });
                navigate("/patients"); // Go back if patient not found
            } finally {
                setLoading(false);
            }
        };
        fetchPatientDetail();
    }, [id, navigate, toast]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageHeader
                title={`${patient.first_name} ${patient.last_name}`}
                description={`Ghana Card: ${patient.ghana_card_id}`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Patients", href: "/patients" },
                    { label: `${patient.first_name} ${patient.last_name}` },
                ]}
            />

            <Button variant="outline" onClick={() => navigate("/patients")} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>DOB:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}</p>
                        <p><strong>Gender:</strong> {patient.gender}</p>
                        <p><strong>Phone:</strong> {patient.phone_number}</p>
                        <p><strong>Address:</strong> {patient.address}</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" /> Medical History
                        </CardTitle>
                        <Button size="sm">New Consultation</Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">Past consultation notes and lab results will appear here.</p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}