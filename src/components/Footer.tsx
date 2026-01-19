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
    </footer>
  );
};

export default Footer;
