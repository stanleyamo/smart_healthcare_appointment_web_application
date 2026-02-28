import { useState, useEffect } from "react";
import { Users, CalendarDays, Stethoscope, AlertTriangle, TrendingUp, Clock, UserPlus, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatCard } from "@/components/emr/StatCard";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import api from "@/lib/api";

const Index = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientRes, apptRes] = await Promise.all([
          api.get('patients/'),
          api.get('appointments/')
        ]);

        setPatients(patientRes.data.slice(-5).reverse());
        setAppointments(apptRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("Error connecting to Django API:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
        <DashboardLayout>
          <div className="flex h-[50vh] items-center justify-center">
            <p className="text-lg font-medium animate-pulse text-medical-600">
              Connecting to SmartHealth Backend...
            </p>
          </div>
        </DashboardLayout>
    );
  }

  return (
      <DashboardLayout>
        <PageHeader
            title="Dashboard"
            description="Welcome back — here's your live overview for today."
            actions={
              <Link to="/patients">
                <Button size="sm" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  New Patient
                </Button>
              </Link>
            }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
              title="Total Registered"
              value={patients.length}
              change="Live from DB"
              changeType="positive"
              icon={Users}
          />
          <StatCard
              title="Appointments"
              value={appointments.length}
              change="Scheduled today"
              changeType="neutral"
              icon={CalendarDays}
          />
          <StatCard title="Consultations" value={0} change="Awaiting records" changeType="neutral" icon={Stethoscope} />
          <StatCard title="Critical Alerts" value={0} change="Clear for now" changeType="positive" icon={AlertTriangle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border bg-card shadow-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-sm font-semibold font-display">Recent Patients</h2>
              <Link to="/patients" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y">
              {patients.length > 0 ? (
                  patients.map((patient: any) => (
                      <div key={patient.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{patient.first_name} {patient.last_name}</p>
                          <p className="text-xs text-muted-foreground">{patient.ghana_card_id} • {patient.phone}</p>
                        </div>
                        <StatusBadge variant="active">Active</StatusBadge>
                        <span className="text-xs text-muted-foreground hidden sm:block">Registered</span>
                      </div>
                  ))
              ) : (
                  <p className="p-4 text-xs text-muted-foreground italic">No patients in database.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card shadow-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-sm font-semibold font-display">Upcoming</h2>
              <Link to="/appointments" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
                Schedule <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y">
              {appointments.length > 0 ? (
                  appointments.map((apt: any, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/15 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Appt #{apt.id}</p>
                          <p className="text-xs text-muted-foreground">{new Date(apt.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <StatusBadge variant="pending">{apt.status}</StatusBadge>
                      </div>
                  ))
              ) : (
                  <p className="p-4 text-xs text-muted-foreground italic">No appointments scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
  );
};

export default Index;