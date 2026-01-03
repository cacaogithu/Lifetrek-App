import { useState, useEffect } from "react";
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
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    // Check if this is a password recovery redirect
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    console.log("[AdminLogin] 🔍 Verificando URL hash:", window.location.hash);
    console.log("[AdminLogin] - type:", type);
    console.log("[AdminLogin] - access_token:", accessToken ? "PRESENTE" : "AUSENTE");
    
    if (type === 'recovery' && accessToken) {
      console.log("[AdminLogin] 🔑 MODO RECUPERAÇÃO ATIVADO");
      setIsRecoveryMode(true);
      toast.info("Digite sua nova senha abaixo.");
    }

    // Listen for auth state changes (handles the recovery session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AdminLogin] 🔄 Auth event:", event);
      if (event === 'PASSWORD_RECOVERY') {
        console.log("[AdminLogin] 🔑 PASSWORD_RECOVERY event recebido");
        setIsRecoveryMode(true);
        toast.info("Digite sua nova senha.");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log("[AdminLogin] 🔄 Atualizando senha...");
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) {
        console.error("[AdminLogin] ❌ Erro ao atualizar senha:", error.message);
        toast.error(error.message);
        return;
      }
      
      console.log("[AdminLogin] ✅ Senha atualizada com sucesso!");
      toast.success("Senha atualizada! Faça login com sua nova senha.");
      setIsRecoveryMode(false);
      setNewPassword("");
      
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
      
      // Sign out so they can log in fresh
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("[AdminLogin] ❌ Erro:", error.message);
      toast.error(error.message || "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

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
      toast.error("Por favor, digite seu email");
      return;
    }
    
    setLoading(true);
    console.log("[AdminLogin] 📧 Enviando email de reset para:", email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      
      if (error) {
        console.error("[AdminLogin] ❌ Erro no reset:", error.message);
        throw error;
      }
      
      console.log("[AdminLogin] ✅ Email de reset enviado!");
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email de reset");
    } finally {
      setLoading(false);
    }
  };

  // Recovery mode UI
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Nova Senha</h1>
            <p className="text-foreground/70 text-center text-base">
              Digite sua nova senha abaixo
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground font-medium">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-12"
                aria-label="Nova senha"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base" 
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Nova Senha"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

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
