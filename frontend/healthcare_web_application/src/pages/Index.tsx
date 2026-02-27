import { Users, CalendarDays, Stethoscope, AlertTriangle, TrendingUp, Clock, UserPlus, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatCard } from "@/components/emr/StatCard";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const recentPatients = [
  { id: "GH-2024-4521", name: "Kwame Asante", age: 45, gender: "M", status: "active" as const, time: "10 min ago" },
  { id: "GH-2024-4520", name: "Abena Mensah", age: 32, gender: "F", status: "pending" as const, time: "25 min ago" },
  { id: "GH-2024-4519", name: "Yaw Boateng", age: 67, gender: "M", status: "critical" as const, time: "1 hr ago" },
  { id: "GH-2024-4518", name: "Ama Darko", age: 28, gender: "F", status: "completed" as const, time: "2 hrs ago" },
  { id: "GH-2024-4517", name: "Kofi Adjei", age: 54, gender: "M", status: "active" as const, time: "3 hrs ago" },
];

const upcomingAppointments = [
  { time: "10:00 AM", patient: "Efua Owusu", type: "Follow-up", department: "Cardiology" },
  { time: "10:30 AM", patient: "Nana Akufo", type: "New Visit", department: "General OPD" },
  { time: "11:00 AM", patient: "Adwoa Badu", type: "Lab Review", department: "Internal Med" },
  { time: "11:30 AM", patient: "Kwesi Appiah", type: "Follow-up", department: "Diabetes Clinic" },
];

const Index = () => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back, Dr. Mensah — here's your overview for today."
        actions={
          <Link to="/register">
            <Button size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              New Patient
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Patients Today" value={128} change="+12% from yesterday" changeType="positive" icon={Users} />
        <StatCard title="Appointments" value={42} change="8 remaining" changeType="neutral" icon={CalendarDays} />
        <StatCard title="Consultations" value={34} change="+5 completed this hour" changeType="positive" icon={Stethoscope} />
        <StatCard title="Critical Alerts" value={3} change="2 require immediate action" changeType="negative" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent patients */}
        <div className="lg:col-span-2 rounded-lg border bg-card shadow-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-sm font-semibold font-display">Recent Patients</h2>
            <Link to="/patients" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {patient.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.id} • {patient.age}y {patient.gender}</p>
                </div>
                <StatusBadge variant={patient.status}>{patient.status}</StatusBadge>
                <span className="text-xs text-muted-foreground hidden sm:block">{patient.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="rounded-lg border bg-card shadow-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-sm font-semibold font-display">Upcoming</h2>
            <Link to="/appointments" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
              Schedule <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {upcomingAppointments.map((apt, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/15 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{apt.patient}</p>
                  <p className="text-xs text-muted-foreground">{apt.type} • {apt.department}</p>
                </div>
                <span className="text-xs font-medium text-foreground shrink-0">{apt.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Bed Occupancy", value: "78%", icon: TrendingUp },
          { label: "Avg Wait Time", value: "24 min", icon: Clock },
          { label: "Lab Pending", value: "12", icon: Stethoscope },
          { label: "Discharges Today", value: "8", icon: Users },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-soft">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Index;
