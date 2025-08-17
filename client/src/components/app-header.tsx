import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import logoImage from "@assets/generated_images/ShonoWave_radio_app_logo_fd5b9b14.png";

export function AppHeader() {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === "accepted") {
        toast({
          title: "App Installed",
          description: "ShonoWave has been installed successfully!",
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error("Install prompt error:", error);
      toast({
        title: "Installation Error",
        description: "Failed to install the app",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 glass dark:glass-dark backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 hover:scale-105 transition-transform duration-200 group" data-testid="link-logo-home">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:shadow-sw-primary/25 transition-all duration-200">
            <img 
              src={logoImage} 
              alt="ShonoWave Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="logo-text text-3xl font-logo font-black tracking-tight">
              ShonoWave
            </h1>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 -mt-1 tracking-wider uppercase">
              Worldwide Radio
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* PWA Install Button */}
          {showInstallButton && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-gradient-to-r from-sw-primary to-sw-secondary hover:from-sw-primary/90 hover:to-sw-secondary/90 text-white shadow-lg hover:shadow-sw-primary/25 backdrop-blur-sm border-0 transition-all duration-200"
              data-testid="button-install-pwa"
            >
              <i className="fas fa-download mr-1"></i>
              Install
            </Button>
          )}
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Favorites Link */}
          <Link href="/favorites">
            <Button
              size="sm"
              variant="outline"
              className="glass dark:glass-dark backdrop-blur-sm border-white/30 dark:border-white/20 hover:border-sw-accent/50 dark:hover:border-sw-accent/50 transition-all duration-200"
              data-testid="button-favorites"
            >
              <i className="fas fa-heart text-red-400 mr-1 drop-shadow-sm"></i>
              <span className="hidden sm:inline">Favorites</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
