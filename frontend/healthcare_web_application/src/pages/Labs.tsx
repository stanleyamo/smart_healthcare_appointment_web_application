import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, Search, Plus, FileDown, Loader2, ClipboardCheck } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Labs() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [resultText, setResultText] = useState("");
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("labs/");
      setOrders(res.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch diagnostic orders." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmitResult = async () => {
    try {
      await api.patch(`labs/${selectedOrder.id}/`, {
        results: resultText,
        status: "COMPLETED"
      });
      toast({ title: "Success", description: "Results submitted successfully." });
      setIsResultDialogOpen(false);
      setResultText("");
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit results." });
    }
  };

  const filtered = orders.filter((o: any) =>
    o.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    o.test_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTakeSample = async (orderId: string) => {
    try {
      await api.patch(`labs/${orderId}/`, {
        status: "SAMPLE_TAKEN"
      });
      toast({ title: "Sample Collected", description: "Status updated. You may now input results." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update order status." });
    }
  };

  const labData = filtered.filter((o: any) => o.category === "LAB");
  const radData = filtered.filter((o: any) => o.category === "RAD");

  const userRole = localStorage.getItem("user_role") || "Staff";

  return (
    <DashboardLayout>
      <PageHeader
        title="Labs & Radiology"
        description="Manage diagnostic requests and input patient results"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Labs" }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient or test..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={fetchData} variant="outline" className="mr-2">Refresh</Button>
      </div>

      <Tabs defaultValue="lab">
        <TabsList className="mb-4">
          <TabsTrigger value="lab">Laboratory</TabsTrigger>
          <TabsTrigger value="radiology">Radiology</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <>
            <TabsContent value="lab"><OrderTable orders={labData} onOpenResult={(o) => { setSelectedOrder(o); setIsResultDialogOpen(true); }} onTakeSample={handleTakeSample} userRole={userRole} /></TabsContent>
            <TabsContent value="radiology"><OrderTable orders={radData} onOpenResult={(o) => { setSelectedOrder(o); setIsResultDialogOpen(true); }} onTakeSample={handleTakeSample} userRole={userRole} /></TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Results: {selectedOrder?.test_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Patient: <strong>{selectedOrder?.patient_name}</strong></p>
            <Textarea
              placeholder="Enter findings, measurements, or observations..."
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitResult}>Confirm & Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export function OrderTable({ orders, onOpenResult, onTakeSample, userRole }: { orders: any[], onOpenResult: (o: any) => void, onTakeSample: (id: string) => void, userRole: string }) {
  const canModify = userRole === "LAB_TECH" || userRole === "RADIOLOGIST";

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Ordered By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result Summary</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No orders found.</TableCell></TableRow>
            ) : (
              orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.patient_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-3 w-3 text-primary" />
                      {o.test_name}
                    </div>
                  </TableCell>
                  <TableCell>{o.doctor_name}</TableCell>
                  <TableCell>
                    <StatusBadge variant={o.status.toLowerCase() as any}>{o.status}</StatusBadge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {o.results || <span className="text-muted-foreground italic">Awaiting input...</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    {!canModify ? (
                      <span className="text-xs text-muted-foreground mr-2">
                        {o.status === "COMPLETED" ? "Available in History" : "Awaiting processing"}
                      </span>
                    ) : o.status === 'PENDING' ? (
                      <Button size="sm" variant="secondary" onClick={() => onTakeSample(o.id)}>
                        Collect Sample
                      </Button>
                    ) : o.status === 'SAMPLE_TAKEN' ? (
                      <Button size="sm" onClick={() => onOpenResult(o)}>
                        <ClipboardCheck className="h-4 w-4 mr-1" /> Input Result
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}