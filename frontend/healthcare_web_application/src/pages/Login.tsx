import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(168_55%_35%)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(40_85%_55%/0.15)_0%,transparent_50%)]" />
        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Heart className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display text-primary-foreground mb-3">
            Ghana Health EMR
          </h1>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            Secure electronic medical records for Ghana Health Service hospitals. 
            Delivering quality healthcare through digital innovation.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Hospitals", value: "120+" },
              { label: "Records", value: "2.5M+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-primary-foreground/10 p-3">
                <p className="text-lg font-bold text-accent">{stat.value}</p>
                <p className="text-[11px] text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display">GH-EMR</span>
          </div>

          <h2 className="text-xl font-bold font-display mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to access the EMR system</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staffId" className="text-xs font-medium">Staff ID</Label>
              <Input id="staffId" placeholder="e.g. GHS-2024-0012" className="h-10" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="facility" className="text-xs font-medium">Facility</Label>
              <select
                id="facility"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select facility</option>
                <option>Korle Bu Teaching Hospital</option>
                <option>Komfo Anokye Teaching Hospital</option>
                <option>Tamale Teaching Hospital</option>
                <option>Cape Coast Teaching Hospital</option>
                <option>37 Military Hospital</option>
              </select>
            </div>

            <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected by Ghana Health Service IT Security
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
