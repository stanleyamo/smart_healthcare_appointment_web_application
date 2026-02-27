import { useState } from "react";
import { Search, Filter, Download, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const patients = [
  { id: "GH-2024-4521", name: "Kwame Asante", age: 45, gender: "Male", phone: "024-123-4567", region: "Greater Accra", status: "active" as const, lastVisit: "Feb 27, 2026" },
  { id: "GH-2024-4520", name: "Abena Mensah", age: 32, gender: "Female", phone: "020-987-6543", region: "Ashanti", status: "active" as const, lastVisit: "Feb 26, 2026" },
  { id: "GH-2024-4519", name: "Yaw Boateng", age: 67, gender: "Male", phone: "027-456-7890", region: "Central", status: "critical" as const, lastVisit: "Feb 27, 2026" },
  { id: "GH-2024-4518", name: "Ama Darko", age: 28, gender: "Female", phone: "055-234-5678", region: "Greater Accra", status: "inactive" as const, lastVisit: "Jan 15, 2026" },
  { id: "GH-2024-4517", name: "Kofi Adjei", age: 54, gender: "Male", phone: "024-678-9012", region: "Northern", status: "active" as const, lastVisit: "Feb 25, 2026" },
  { id: "GH-2024-4516", name: "Efua Owusu", age: 39, gender: "Female", phone: "020-345-6789", region: "Western", status: "pending" as const, lastVisit: "Feb 24, 2026" },
  { id: "GH-2024-4515", name: "Nana Akufo", age: 71, gender: "Male", phone: "027-890-1234", region: "Eastern", status: "active" as const, lastVisit: "Feb 23, 2026" },
  { id: "GH-2024-4514", name: "Adwoa Badu", age: 42, gender: "Female", phone: "055-567-8901", region: "Volta", status: "completed" as const, lastVisit: "Feb 22, 2026" },
];

const PatientSearch = () => {
  const [query, setQuery] = useState("");

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Patient Search"
        description="Search and manage patient records across all facilities."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Patient Search" }]}
        actions={
          <Link to="/register">
            <Button size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              Register Patient
            </Button>
          </Link>
        }
      />

      {/* Search & Filters */}
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

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Patient ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Age/Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Region</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((patient) => (
                <tr key={patient.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{patient.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {patient.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{patient.age}y • {patient.gender}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{patient.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{patient.region}</td>
                  <td className="px-4 py-3"><StatusBadge variant={patient.status}>{patient.status}</StatusBadge></td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{patient.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {patients.length} patients</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 min-w-8 bg-primary text-primary-foreground border-primary">1</Button>
            <Button variant="outline" size="sm" className="h-8 min-w-8">2</Button>
            <Button variant="outline" size="sm" className="h-8 min-w-8">3</Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientSearch;
