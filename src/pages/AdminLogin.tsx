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

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      // Try to sign up the admin user
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: "admin@precisionparts.com",
        password: "admin123",
      });

      if (signupError) {
        // If user already exists, that's fine
        if (signupError.message.includes("already registered")) {
          toast.error("Admin já existe. Use o Dev Login.");
          setEmail("admin@precisionparts.com");
          setPassword("admin123");
        } else {
          throw signupError;
        }
        return;
      }

      if (signupData.user) {
        // Add to admin_users table
        const { error: adminError } = await supabase
          .from("admin_users")
          .insert({ user_id: signupData.user.id });

        if (adminError && !adminError.message.includes("duplicate")) {
          console.error("Error adding to admin_users:", adminError);
        }

        toast.success("Admin criado! Use o Dev Login agora.");
        setEmail("admin@precisionparts.com");
        setPassword("admin123");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
          <p className="text-muted-foreground text-center">
            Access the internal analytics dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lifetrek.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={handleDevLogin}
            disabled={loading}
          >
            🔧 Dev Login (Temporário)
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            className="w-full" 
            onClick={handleCreateAdmin}
            disabled={loading}
          >
            ➕ Criar Admin (Primeira vez)
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground"
          >
            Back to website
          </Button>
        </div>
      </Card>
    </div>
  );
}
