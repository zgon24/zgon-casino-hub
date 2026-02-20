const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-gradient-gold">ZGON</div>
        
        {/* Copyright */}
        <p className="text-muted-foreground text-sm">
          © 2025 ZGON. Todos os direitos reservados.
        </p>
        
        {/* Responsible gambling */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground/70">
          <span className="text-primary font-semibold">+18</span>
          <span>Gamble Responsibly</span>
          <span>•</span>
          <a
            href="https://www.jogoresponsavel.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors duration-200"
          >
            Gambling Help (IAJ)
          </a>
        </div>

        {/* Additional disclaimer */}
        <p className="text-xs text-muted-foreground/50 max-w-md mx-auto mt-6">
          O jogo pode causar dependência. Jogue com responsabilidade e dentro das suas possibilidades.
        </p>
      </div>

      {/* Legal disclaimer */}
      <div className="max-w-3xl mx-auto mt-10 px-4">
        <div className="border border-border/30 rounded-xl bg-card/50 backdrop-blur-sm p-6 space-y-4">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/70 text-center">
            Aviso Legal
          </h4>
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground/60 text-center">
            <p>
              O registo em qualquer uma das marcas divulgadas é uma escolha individual e da total responsabilidade de cada utilizador. A comunidade ZGON tem uma presença internacional, pelo que algumas das marcas apresentadas poderão não estar autorizadas ou regulamentadas no país de residência do utilizador.
            </p>
            <p>
              Aconselhamos a consulta cuidadosa dos respetivos termos e condições, sendo que a utilização de qualquer plataforma pressupõe a aceitação integral das suas regras.
            </p>
            <p>
              Todas as entidades mencionadas destinam-se exclusivamente a maiores de 18 anos. A equipa ZGON declina qualquer responsabilidade por qualquer incumprimento do disposto acima.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
