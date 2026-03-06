import { useState, useEffect } from "react";
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
import { Building2, Bell, Shield, Palette, Loader2, Save } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { updateFacilityName } = useSettings();

  const [config, setConfig] = useState({
    facility_name: "",
    facility_code: "",
    region: "greater-accra",
    district: "",
    contact_phone: "",
    email: "",
    session_timeout: 30,
    max_login_attempts: 5,
    two_factor_auth: false,
    password_expiry: true,
    audit_logging: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    density: "comfortable",
    notifications: {
      appointments: true,
      lab_results: true,
      system_alerts: true,
      new_patient: false,
      prescriptions: true,
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("settings/1/");
        setConfig(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.warn("Settings record not found on server, using local defaults.");
        } else {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Could not reach the server."
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);



  const handleUpdateConfig = async () => {
    setSaving(true);
    try {
      await api.patch("settings/1/", config);
      updateFacilityName(config.facility_name);

      toast({ title: "Settings Saved" });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = () => {
    localStorage.setItem("app_preferences", JSON.stringify(preferences));
    toast({ title: "Preferences Saved", description: "Appearance and notification settings updated locally." });
  };

  if (loading) return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      </DashboardLayout>
  );

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
                  <div>
                    <Label>Facility Name</Label>
                    <Input value={config.facility_name} onChange={e => setConfig({...config, facility_name: e.target.value})} />
                  </div>
                  <div>
                    <Label>Facility Code</Label>
                    <Input value={config.facility_code} onChange={e => setConfig({...config, facility_code: e.target.value})} />
                  </div>
                  <div>
                    <Label>Region</Label>
                    <Select value={config.region} onValueChange={v => setConfig({...config, region: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ahafo">Ahafo</SelectItem>
                        <SelectItem value="ashanti">Ashanti</SelectItem>
                        <SelectItem value="bono">Bono</SelectItem>
                        <SelectItem value="bono-east">Bono East</SelectItem>
                        <SelectItem value="central">Central</SelectItem>
                        <SelectItem value="eastern">Eastern</SelectItem>
                        <SelectItem value="greater-accra">Greater Accra</SelectItem>
                        <SelectItem value="north-east">North East</SelectItem>
                        <SelectItem value="northern">Northern</SelectItem>
                        <SelectItem value="oti">Oti</SelectItem>
                        <SelectItem value="savannah">Savannah</SelectItem>
                        <SelectItem value="upper-east">Upper East</SelectItem>
                        <SelectItem value="upper-west">Upper West</SelectItem>
                        <SelectItem value="volta">Volta</SelectItem>
                        <SelectItem value="western">Western</SelectItem>
                        <SelectItem value="western-north">Western North</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>District</Label><Input value={config.district} onChange={e => setConfig({...config, district: e.target.value})} /></div>
                  <div><Label>Contact Phone</Label><Input value={config.contact_phone} onChange={e => setConfig({...config, contact_phone: e.target.value})} /></div>
                  <div><Label>Email</Label><Input value={config.email} onChange={e => setConfig({...config, email: e.target.value})} /></div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleUpdateConfig} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Facility Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {Object.keys(preferences.notifications).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium capitalize">{key.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">Receive alerts for this category.</p>
                      </div>
                      <Switch
                          checked={(preferences.notifications as any)[key]}
                          onCheckedChange={(v) => setPreferences({
                            ...preferences,
                            notifications: {...preferences.notifications, [key]: v}
                          })}
                      />
                    </div>
                ))}
                <div className="flex justify-end"><Button onClick={savePreferences}>Save Notification Defaults</Button></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle className="text-base">Security Settings</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Session Timeout (min)</Label>
                    <Input type="number" value={config.session_timeout} onChange={e => setConfig({...config, session_timeout: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Max Attempts</Label>
                    <Input type="number" value={config.max_login_attempts} onChange={e => setConfig({...config, max_login_attempts: parseInt(e.target.value)})} />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Audit Logging</p></div>
                  <Switch checked={config.audit_logging} onCheckedChange={v => setConfig({...config, audit_logging: v})} />
                </div>
                <div className="flex justify-end"><Button onClick={handleUpdateConfig}>Save Security</Button></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <Select value={preferences.theme} onValueChange={v => setPreferences({...preferences, theme: v})}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex justify-end"><Button onClick={savePreferences}>Save UI Preferences</Button></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
  );
}