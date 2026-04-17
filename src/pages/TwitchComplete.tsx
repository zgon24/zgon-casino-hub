import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const TwitchComplete = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const token_hash = params.get("token_hash");
      const type = params.get("type");

      if (!token_hash || !type) {
        setError("Parâmetros em falta.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as "magiclink",
      });

      if (error) {
        console.error(error);
        setError("Não foi possível concluir o login. Tenta novamente.");
        return;
      }

      navigate("/shop", { replace: true });
    };
    run();
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        {!error ? (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">A concluir o login com a Twitch...</p>
          </>
        ) : (
          <>
            <p className="text-destructive font-medium">{error}</p>
            <button
              onClick={() => navigate("/auth")}
              className="text-sm text-primary hover:underline"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TwitchComplete;
