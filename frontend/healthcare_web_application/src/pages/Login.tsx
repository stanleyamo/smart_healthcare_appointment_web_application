import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("token/", credentials);
      const { access, refresh, role, full_name } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_role", role || "GUEST");
      localStorage.setItem("user_name", full_name || "Staff Member");

      toast({
        title: "Login Successful",
        description: `Welcome back, ${full_name}.`,
      });

      switch (role) {
        case 'RECEPTIONIST':
          navigate("/register");
          break;
        case 'DOCTOR':
          navigate("/appointments");
          break;
        case 'LAB_TECH':
          navigate("/labs");
          break;
        case 'PHARMACIST':
          navigate("/prescriptions");
          break;
        default:
          navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials or account inactive.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
          <div className="relative z-10 max-w-md px-8 text-center">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <Heart className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-display text-primary-foreground mb-3">Ghana Health EMR</h1>
            <p className="text-primary-foreground/70 text-sm">Secure digital healthcare for the nation.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-bold mb-1">Staff Login</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your credentials to access the portal</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Staff ID</Label>
                <Input id="username" name="username" value={credentials.username} onChange={handleChange} placeholder="e.g. admin" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={handleChange}
                      required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Login;