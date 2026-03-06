import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/emr/DashboardLayout";
import { PageHeader } from "@/components/emr/PageHeader";
import { StatusBadge } from "@/components/emr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ShieldCheck,
  Search,
  Plus,
  MoreHorizontal,
  Loader2,
  Trash2,
  UserX,
  UserCheck,
  KeyRound
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const roleColors: Record<string, string> = {
  DOCTOR: "bg-primary/10 text-primary border-primary/20",
  NURSE: "bg-blue-100 text-blue-700 border-blue-200",
  LAB_TECH: "bg-amber-100 text-amber-700 border-amber-200",
  RAD_TECH: "bg-purple-100 text-purple-700 border-purple-200",
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  OPD: "bg-green-100 text-green-700 border-green-200",
};

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");


  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "OPD",
    password: "Hospital@2026"
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("users/");
      setUsers(res.data);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load staff list." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Username and Email are required." });
      return;
    }
    try {
      await api.post("users/", newUser);
      toast({ title: "Success", description: "Staff account created successfully." });
      setIsAddModalOpen(false);
      setNewUser({ username: "", email: "", first_name: "", last_name: "", role: "OPD", password: "Hospital@2026" });
      fetchUsers();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not create user. Check if username exists." });
    }
  };

  const toggleUserStatus = async (user: any) => {
    try {
      await api.patch(`users/${user.id}/`, { is_active: !user.is_active });
      toast({ title: "Status Updated", description: `${user.first_name} is now ${!user.is_active ? 'Active' : 'Inactive'}.` });
      fetchUsers();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not update status." });
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    try {
      await api.patch(`users/${resettingUser.id}/`, { password: newPassword });
      toast({ title: "Success", description: "Password updated successfully." });
      setResettingUser(null);
      setNewPassword("");
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Reset failed." });
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Are you sure? This will permanently remove the staff record.")) return;
    try {
      await api.delete(`users/${id}/`);
      toast({ title: "Deleted", description: "User removed from system." });
      fetchUsers();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Delete failed." });
    }
  };

  const filtered = users.filter(u =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <DashboardLayout>
        <PageHeader
            title="User Management"
            description="Administer staff credentials and access levels"
        />

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Register New Staff</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="First Name" value={newUser.first_name} onChange={e => setNewUser({...newUser, first_name: e.target.value})} />
                <Input placeholder="Last Name" value={newUser.last_name} onChange={e => setNewUser({...newUser, last_name: e.target.value})} />
              </div>
              <Input placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
              <Input placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <select
                  className="w-full border rounded-md p-2 text-sm bg-background"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="LAB_TECH">Lab Technician</option>
                <option value="RAD_TECH">Radiology Technician</option>
                <option value="OPD">OPD / Front Desk</option>
                <option value="ADMIN">Administrator</option>
              </select>
              <p className="text-[10px] text-muted-foreground italic">Default Password: Hospital@2026</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUser}>Create Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!resettingUser} onOpenChange={() => setResettingUser(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm">Setting new password for <strong>{resettingUser?.username}</strong></p>
              <Input
                  type="password"
                  placeholder="New Secure Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResettingUser(null)}>Cancel</Button>
              <Button onClick={handleResetPassword}>Save Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search staff by name, role, or username..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Add User</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
                <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.first_name} {user.last_name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{user.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] font-bold ${roleColors[user.role] || ''}`}>
                              <ShieldCheck className="h-3 w-3 mr-1" />{user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge variant={user.is_active ? "active" : "inactive"}>
                              {user.is_active ? "Active" : "Inactive"}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Manage Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setResettingUser(user)}>
                                  <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                                  {user.is_active ? (
                                      <><UserX className="mr-2 h-4 w-4 text-orange-500" /> Deactivate</>
                                  ) : (
                                      <><UserCheck className="mr-2 h-4 w-4 text-green-500" /> Activate</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => deleteUser(user.id)} className="text-destructive focus:bg-destructive/10">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
  );
}