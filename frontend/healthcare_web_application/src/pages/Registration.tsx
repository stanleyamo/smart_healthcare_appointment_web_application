import { useState } from "react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

const Registration = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        ghana_card_id: "",
        phone: "",
        address: "",
        allergies: "",
        chronic_conditions: "",
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const steps = [
        { number: 1, label: "Personal Info" },
        { number: 2, label: "Contact Details" },
        { number: 3, label: "Medical History" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("patients/", formData);

            toast({
                title: "Success!",
                description: `Patient ${response.data.first_name} has been registered.`
            });


            setTimeout(() => navigate("/patients"), 2000);
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.response?.data?.ghana_card_id?.[0] || "Please check your inputs."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Patient Registration"
                description="Register a new patient into the EMR system."
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Registration" }]}
            />

            <div className="flex items-center gap-2 mb-6">
                {steps.map((s, i) => (
                    <div key={s.number} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setStep(s.number)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                step >= s.number ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {s.number}
                        </button>
                        <span className={`text-sm font-medium hidden sm:block ${step >= s.number ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
                        {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="rounded-lg border bg-card shadow-card p-5 space-y-5">
                    {step === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">First Name *</Label>
                                <Input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter first name" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Last Name *</Label>
                                <Input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter last name" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Date of Birth *</Label>
                                <Input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Gender *</Label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                    <option value="">Select gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Ghana Card Number *</Label>
                                <Input name="ghana_card_id" value={formData.ghana_card_id} onChange={handleChange} placeholder="GHA-XXXXXXXXX-X" required />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Phone Number *</Label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="024-XXX-XXXX" required />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-xs font-medium">Address</Label>
                                <Input name="address" value={formData.address} onChange={handleChange} placeholder="House number, street name" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Allergies (Drug, Food, Environment) *</Label>
                                <Textarea
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    placeholder="List known allergies (e.g., Penicillin, Peanuts)..."
                                    className="border-red-200"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Chronic Conditions *</Label>
                                <Textarea
                                    name="chronic_conditions"
                                    value={formData.chronic_conditions}
                                    onChange={handleChange}
                                    placeholder="List chronic illnesses (e.g., Hypertension, Diabetes)..."
                                    className="border-red-200"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1 || loading}
                        >
                            Previous
                        </Button>
                        {step < 3 ? (
                            <Button type="button" onClick={() => setStep(step + 1)} className="gap-1.5">
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={loading} className="gap-1.5">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Register Patient
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
};

export default Registration;