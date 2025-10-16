import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (!adminData) {
          await supabase.auth.signOut();
          toast.error("Access denied. Not an admin user.");
          return;
        }

        toast.success("Login successful!");
        navigate("/admin");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = () => {
    setEmail("admin@precisionparts.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Admin Login</h1>
          <p className="text-foreground/70 text-center text-base">
            Access the internal analytics dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lifetrek.com"
              required
              className="h-12"
              aria-label="Admin email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12"
              aria-label="Admin password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base" 
            disabled={loading}
            aria-label={loading ? "Logging in, please wait" : "Login to admin dashboard"}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 text-base" 
            onClick={handleDevLogin}
            disabled={loading}
            aria-label="Development login with pre-filled credentials"
          >
            <span className="mr-2" aria-hidden="true">🔧</span>
            Dev Login (Development)
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-base h-12 min-w-[44px] min-h-[44px]"
            aria-label="Return to main website homepage"
          >
            Back to website
          </Button>
        </div>
      </Card>
    </div>
  );
}
