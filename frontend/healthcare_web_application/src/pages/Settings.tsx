import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Building2, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        description="System configuration and preferences"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="facility" className="space-y-4">
        <TabsList>
          <TabsTrigger value="facility"><Building2 className="h-4 w-4 mr-1.5" />Facility</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-1.5" />Security</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4 mr-1.5" />Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="facility">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Facility Information</CardTitle>
              <CardDescription>Configure hospital details and regional settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Facility Name</Label><Input defaultValue="Korle Bu Teaching Hospital" /></div>
                <div><Label>Facility Code</Label><Input defaultValue="KBTH-001" /></div>
                <div><Label>Region</Label>
                  <Select defaultValue="greater-accra">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater-accra">Greater Accra</SelectItem>
                      <SelectItem value="ashanti">Ashanti</SelectItem>
                      <SelectItem value="central">Central</SelectItem>
                      <SelectItem value="western">Western</SelectItem>
                      <SelectItem value="eastern">Eastern</SelectItem>
                      <SelectItem value="northern">Northern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>District</Label><Input defaultValue="Accra Metropolitan" /></div>
                <div><Label>Contact Phone</Label><Input defaultValue="+233 302 665 401" /></div>
                <div><Label>Email</Label><Input defaultValue="info@kbth.gov.gh" /></div>
              </div>
              <Separator />
              <div className="flex justify-end"><Button>Save Changes</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Appointment Reminders", desc: "Get notified about upcoming appointments", default: true },
                { label: "Lab Results Ready", desc: "Receive alerts when lab results are available", default: true },
                { label: "System Alerts", desc: "Critical system notifications and downtime warnings", default: true },
                { label: "New Patient Registration", desc: "Notify when a new patient is registered", default: false },
                { label: "Prescription Alerts", desc: "Drug interaction and allergy warnings", default: true },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Settings</CardTitle>
              <CardDescription>Authentication and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Session Timeout (minutes)</Label><Input type="number" defaultValue="30" /></div>
                <div><Label>Max Login Attempts</Label><Input type="number" defaultValue="5" /></div>
              </div>
              <Separator />
              {[
                { label: "Two-Factor Authentication", desc: "Require 2FA for all users", default: false },
                { label: "Password Expiry", desc: "Force password change every 90 days", default: true },
                { label: "Audit Logging", desc: "Log all user actions for compliance", default: true },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Switch defaultChecked={s.default} />
                </div>
              ))}
              <Separator />
              <div className="flex justify-end"><Button>Save Security Settings</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Density</Label>
                <Select defaultValue="comfortable">
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex justify-end"><Button>Save Preferences</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
