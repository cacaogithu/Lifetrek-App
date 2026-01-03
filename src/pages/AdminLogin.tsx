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

    console.log("========================================");
    console.log("[AdminLogin] 🚀 Iniciando tentativa de login");
    console.log("[AdminLogin] 📧 Email:", email);
    console.log("[AdminLogin] 🔑 Senha fornecida:", password ? `${password.length} caracteres` : "VAZIA");
    console.log("========================================");

    try {
      console.log("[AdminLogin] ⏳ Chamando supabase.auth.signInWithPassword...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("[AdminLogin] 📦 Resposta recebida:");
      console.log("[AdminLogin] - data:", data ? JSON.stringify(data, null, 2) : "null");
      console.log("[AdminLogin] - error:", error ? JSON.stringify(error, null, 2) : "null");

      if (error) {
        console.error("========================================");
        console.error("[AdminLogin] ❌ ERRO DE AUTENTICAÇÃO");
        console.error("[AdminLogin] - Mensagem:", error.message);
        console.error("[AdminLogin] - Status:", error.status);
        console.error("[AdminLogin] - Nome:", error.name);
        console.error("[AdminLogin] - Código:", (error as any).code);
        console.error("========================================");
        
        if (error.message.includes("Invalid login credentials")) {
          console.error("[AdminLogin] 🔒 Diagnóstico: SENHA INCORRETA ou EMAIL NÃO EXISTE");
          toast.error("Email ou senha incorretos. Verifique suas credenciais.");
          return;
        }
        if (error.message.includes("Email not confirmed")) {
          console.error("[AdminLogin] 📨 Diagnóstico: EMAIL NÃO CONFIRMADO");
          toast.error("Email não confirmado. Verifique sua caixa de entrada.");
          return;
        }
        if (error.message.includes("too many requests")) {
          console.error("[AdminLogin] ⚠️ Diagnóstico: RATE LIMIT - muitas tentativas");
          toast.error("Muitas tentativas. Aguarde alguns minutos.");
          return;
        }
        throw error;
      }
      
      console.log("[AdminLogin] ✅ Autenticação bem-sucedida!");
      console.log("[AdminLogin] 👤 User ID:", data.user?.id);
      console.log("[AdminLogin] 📧 User Email:", data.user?.email);
      console.log("[AdminLogin] 🎫 Session:", data.session ? "PRESENTE" : "AUSENTE");

      if (data.user) {
        console.log("[AdminLogin] ⏳ Verificando se usuário é admin...");
        
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        console.log("[AdminLogin] 🔍 Resultado da verificação admin:");
        console.log("[AdminLogin] - adminData:", adminData ? JSON.stringify(adminData) : "null");
        console.log("[AdminLogin] - adminError:", adminError ? JSON.stringify(adminError) : "null");

        if (!adminData) {
          console.error("[AdminLogin] 🚫 ACESSO NEGADO - Usuário não é admin");
          await supabase.auth.signOut();
          toast.error("Acesso negado. Usuário não é administrador.");
          return;
        }

        console.log("[AdminLogin] 🎉 Login completo! Redirecionando para /admin...");
        toast.success("Login realizado com sucesso!");
        navigate("/admin");
      }
    } catch (error: any) {
      console.error("========================================");
      console.error("[AdminLogin] 💥 ERRO NÃO TRATADO");
      console.error("[AdminLogin] - Mensagem:", error.message);
      console.error("[AdminLogin] - Stack:", error.stack);
      console.error("========================================");
      toast.error(error.message || "Falha no login");
    } finally {
      console.log("[AdminLogin] 🏁 Processo de login finalizado");
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
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

        <div className="mt-4">
          <Button 
            type="button" 
            variant="link" 
            className="w-full text-base" 
            onClick={handlePasswordReset}
            disabled={loading}
            aria-label="Reset password"
          >
            Forgot password?
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
