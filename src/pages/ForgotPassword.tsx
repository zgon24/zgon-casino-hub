import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

const emailSchema = z.string().email("Email inválido");

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      emailSchema.parse(email);
    } catch {
      setError("Introduz um email válido");
      return;
    }

    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (resetError) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o email. Tenta novamente.",
      });
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Recuperar Password</CardTitle>
            <CardDescription>
              {sent 
                ? "Verifica a tua caixa de email" 
                : "Introduz o teu email para receberes um link de recuperação"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 text-primary text-sm">
                  Enviámos um email para <strong>{email}</strong> com um link para redefinires a tua password.
                </div>
                <p className="text-sm text-muted-foreground">
                  Não recebeste? Verifica a pasta de spam ou tenta novamente.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSent(false)}
                  className="w-full"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50"
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-gold text-primary-foreground font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
