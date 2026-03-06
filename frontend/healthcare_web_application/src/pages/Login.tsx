import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cross, Eye, EyeOff, Loader2, ShieldCheck, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const stats = [
  { icon: Users, label: "Patients Served", value: "120K+" },
  { icon: Activity, label: "Daily Records", value: "4,800" },
  { icon: ShieldCheck, label: "Data Secure", value: "100%" },
];

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
        case "RECEPTIONIST":
          navigate("/register");
          break;
        case "DOCTOR":
          navigate("/appointments");
          break;
        case "LAB_TECH":
          navigate("/labs");
          break;
        case "PHARMACIST":
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
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .login-root * { font-family: 'DM Sans', sans-serif; }
        .login-display { font-family: 'Instrument Serif', serif; }

        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.4; }
          50% { transform: scale(1.05); opacity: 0.15; }
          100% { transform: scale(0.85); opacity: 0.4; }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes Crossbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.1); }
          28% { transform: scale(1); }
          42% { transform: scale(1.08); }
          56% { transform: scale(1); }
        }

        .pulse-ring-1 {
          animation: pulse-ring 4s ease-in-out infinite;
        }
        .pulse-ring-2 {
          animation: pulse-ring 4s ease-in-out infinite 1.3s;
        }
        .pulse-ring-3 {
          animation: pulse-ring 4s ease-in-out infinite 2.6s;
        }
        .animate-float-in { animation: float-in 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-slide-right { animation: slide-right 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }

        .Cross-icon { animation: Crossbeat 2.8s ease-in-out infinite; }

        .stat-card {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.12);
          transition: background 0.2s;
        }
        .stat-card:hover { background: rgba(255,255,255,0.12); }

        .field-wrap { position: relative; }
        .field-line {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          width: 0;
          background: hsl(var(--primary));
          transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
          border-radius: 2px;
        }
        .field-wrap.focused .field-line { width: 100%; }

        .custom-input {
          border: none !important;
          border-bottom: 1.5px solid hsl(var(--border)) !important;
          border-radius: 0 !important;
          background: transparent !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          box-shadow: none !important;
          transition: border-color 0.2s;
        }
        .custom-input:focus {
          border-bottom-color: transparent !important;
          box-shadow: none !important;
          outline: none !important;
        }

        .sign-in-btn {
          position: relative;
          overflow: hidden;
          letter-spacing: 0.04em;
          font-weight: 500;
          transition: opacity 0.2s, transform 0.15s;
        }
        .sign-in-btn:not(:disabled):hover { opacity: 0.92; transform: translateY(-1px); }
        .sign-in-btn:not(:disabled):active { transform: translateY(0); }

        .divider-line {
          height: 1px;
          background: linear-gradient(to right, transparent, hsl(var(--border)), transparent);
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.8);
        }

        .Cross-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .logo-wrap {
          width: 64px; height: 64px;
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          background: hsl(var(--accent));
          box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.12);
        }
      `}</style>

        <div className="login-root min-h-screen flex bg-background">
          <div className="hidden lg:flex lg:w-[52%] bg-primary flex-col justify-between p-12 relative overflow-hidden">
            <div className="Cross-pattern" />
            <div className="pulse-ring-1 absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full border border-white/10" />
            <div className="pulse-ring-2 absolute -bottom-20 -right-20 w-[340px] h-[340px] rounded-full border border-white/8" />
            <div className="pulse-ring-3 absolute -bottom-8 -right-8 w-[200px] h-[200px] rounded-full border border-white/6" />
            <div className="animate-slide-right relative z-10">
            <span className="badge-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              SYSTEM ONLINE
            </span>
            </div>

            <div className="relative z-10 space-y-8">
              <div className="animate-slide-right delay-1 logo-wrap">
                <Cross className="h-7 w-7 text-accent-foreground Cross-icon" />
              </div>

              <div className="animate-slide-right delay-2">
                <h1 className="login-display text-5xl font-normal text-primary-foreground leading-tight mb-3">
                  Ghana Health<br /><em>EMR System</em>
                </h1>
                <p className="text-primary-foreground/60 text-sm font-light leading-relaxed max-w-xs">
                  Unified digital healthcare records for a healthier nation. Secure, fast, and always available.
                </p>
              </div>

              <div className="animate-slide-right delay-3 grid grid-cols-3 gap-3">
                {stats.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="stat-card rounded-xl p-3 text-center">
                      <Icon className="h-4 w-4 text-primary-foreground/50 mx-auto mb-1.5" />
                      <div className="text-lg font-semibold text-primary-foreground">{value}</div>
                      <div className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">{label}</div>
                    </div>
                ))}
              </div>
            </div>

            <div className="animate-slide-right delay-4 relative z-10">
              <div className="divider-line opacity-20 mb-4" />
              <p className="text-primary-foreground/40 text-xs">
                © {new Date().getFullYear()} Ghana Health Service · Ministry of Health
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-background">
            <div className="w-full max-w-[360px] space-y-8">
              <div className="lg:hidden flex items-center gap-3 animate-float-in">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Cross className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">Ghana Health EMR</span>
              </div>


              <div className="animate-float-in delay-1">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">Staff Portal</p>
                <h2 className="login-display text-3xl font-normal text-foreground">Welcome back</h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="animate-float-in delay-2 space-y-1.5">
                  <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Staff ID
                  </Label>
                  <div className={`field-wrap ${focusedField === "username" ? "focused" : ""}`}>
                    <Input
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("username")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. GH-2024-001"
                        required
                        className="custom-input"
                    />
                    <div className="field-line" />
                  </div>
                </div>

                <div className="animate-float-in delay-3 space-y-1.5">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Password
                  </Label>
                  <div className={`field-wrap ${focusedField === "password" ? "focused" : ""}`}>
                    <div className="relative">
                      <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={credentials.password}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="custom-input pr-10"
                      />
                      <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div className="field-line" />
                  </div>
                </div>

                <div className="animate-float-in delay-4 divider-line" />
                <div className="animate-float-in delay-5">
                  <Button type="submit" className="sign-in-btn w-full h-11 text-sm" disabled={loading}>
                    {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Authenticating…
                        </>
                    ) : (
                        "Sign In to Portal"
                    )}
                  </Button>
                </div>
              </form>

              <p className="animate-float-in delay-6 text-center text-xs text-muted-foreground">
                Access is restricted to authorised personnel only.<br />
                Unauthorised access is a criminal offence.
              </p>

            </div>
          </div>
        </div>
      </>
  );
};

export default Login;