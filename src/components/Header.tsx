import zgonAvatar from "@/assets/zgon-avatar.png";

const Header = () => {
  return (
    <header className="relative min-h-[50vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
      
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-6">
        {/* Avatar */}
        <div className="mx-auto w-24 h-24 rounded-full border-4 border-primary/50 overflow-hidden shadow-lg shadow-primary/20 animate-fadeIn">
          <img 
            src={zgonAvatar} 
            alt="ZGON Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Logo / Name */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-gradient-gold animate-fadeIn" style={{ animationDelay: "0.1s" }}>
          ZGON
        </h1>
        
        {/* Tagline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          Casinos patrocinados oficiais do ZGON
        </p>
        
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
        </div>
      </div>
    </header>
  );
};

export default Header;
