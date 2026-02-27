import { useState } from "react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Registration = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const steps = [
    { number: 1, label: "Personal Info" },
    { number: 2, label: "Contact Details" },
    { number: 3, label: "Medical History" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Patient registered successfully", description: "Patient ID: GH-2026-0045 has been created." });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Patient Registration"
        description="Register a new patient into the EMR system."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Registration" }]}
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.number)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= s.number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
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
                <Input placeholder="Enter first name" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Last Name *</Label>
                <Input placeholder="Enter last name" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date of Birth *</Label>
                <Input type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Gender *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Ghana Card Number</Label>
                <Input placeholder="GHA-XXXXXXXXX-X" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">NHIS Number</Label>
                <Input placeholder="Enter NHIS number" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone Number *</Label>
                <Input placeholder="024-XXX-XXXX" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Alternative Phone</Label>
                <Input placeholder="Optional" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Address</Label>
                <Input placeholder="House number, street name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Region *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                  <option value="">Select region</option>
                  <option>Greater Accra</option>
                  <option>Ashanti</option>
                  <option>Central</option>
                  <option>Western</option>
                  <option>Eastern</option>
                  <option>Northern</option>
                  <option>Volta</option>
                  <option>Upper East</option>
                  <option>Upper West</option>
                  <option>Bono</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Emergency Contact</Label>
                <Input placeholder="Name - Phone" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Blood Group</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Genotype</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select</option>
                    <option>AA</option><option>AS</option><option>SS</option><option>AC</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Known Allergies</Label>
                <Textarea placeholder="List any known allergies..." rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Existing Conditions</Label>
                <Textarea placeholder="List any pre-existing conditions..." rows={3} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)} className="gap-1.5">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" className="gap-1.5">
                <Save className="h-4 w-4" /> Register Patient
              </Button>
            )}
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default Registration;
