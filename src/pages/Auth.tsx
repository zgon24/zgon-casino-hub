import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Twitch, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const TERMS_URL = "/#terms";
const PRIVACY_URL = "/#privacy";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/shop");
  }, [user, navigate]);

  useEffect(() => {
    const err = params.get("twitch_error");
    if (err) {
      toast({
        variant: "destructive",
        title: "Erro no login Twitch",
        description: decodeURIComponent(err),
      });
    }
  }, [params, toast]);

  const handleTwitchLogin = () => {
    if (!accepted) {
      toast({
        variant: "destructive",
        title: "Aceita os termos",
        description: "Tens de aceitar os Termos e a Política de Privacidade para continuar.",
      });
      return;
    }
    setIsLoading(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const origin = window.location.origin;
    window.location.href = `${supabaseUrl}/functions/v1/twitch-auth?origin=${encodeURIComponent(origin)}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#9146FF]/15 flex items-center justify-center">
              <Twitch className="w-7 h-7 text-[#9146FF]" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Entra com a tua <span className="text-[#9146FF]">Twitch</span>
            </CardTitle>
            <CardDescription>
              Liga a tua conta Twitch para receberes pontos automaticamente ao veres a live e resgatares prémios na loja.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* How it works */}
            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Ligação segura via OAuth</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Se já tens sessão iniciada na Twitch, só precisas de autorizar.
                  </p>
                </div>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 pl-8 list-disc">
                <li>Não guardamos a tua password da Twitch</li>
                <li>Ganhas pontos mesmo com o site fechado, só por estares na live</li>
                <li>Podes desligar a conta quando quiseres</li>
              </ul>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Li e aceito os{" "}
                <a href={TERMS_URL} className="text-primary hover:underline">
                  Termos e Condições
                </a>{" "}
                e a{" "}
                <a href={PRIVACY_URL} className="text-primary hover:underline">
                  Política de Privacidade
                </a>
                . Autorizo a ZGON a obter o meu username, ID e avatar da Twitch para gerir a minha conta e atribuir pontos.
                Confirmo que tenho mais de 18 anos.
              </label>
            </div>

            <Button
              onClick={handleTwitchLogin}
              disabled={isLoading || !accepted}
              className="w-full bg-[#9146FF] hover:bg-[#7c3aed] text-white font-semibold h-12 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />A redirecionar...
                </>
              ) : (
                <>
                  <Twitch className="w-5 h-5 mr-2" />
                  Entrar com Twitch
                </>
              )}
            </Button>

            {/* Legal */}
            <div className="text-[11px] text-muted-foreground/80 space-y-1.5 border-t border-border/50 pt-4">
              <p className="font-medium text-muted-foreground">Privacidade & Dados</p>
              <p>
                Apenas recolhemos informação essencial fornecida pela Twitch (ID, username, email e avatar) para autenticação e
                atribuição de pontos. Os teus dados são privados, nunca são vendidos nem partilhados com terceiros para fins
                publicitários.
              </p>
              <p>
                Este serviço é destinado a maiores de 18 anos. Joga com responsabilidade —{" "}
                <a
                  href="https://www.jogoresponsavel.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  jogoresponsavel.pt
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
