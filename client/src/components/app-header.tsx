import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-40 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-200 group" data-testid="link-logo-home">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-200">
            <div className="relative">
              <i className="fas fa-broadcast-tower text-white text-lg drop-shadow-sm"></i>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-300 dark:via-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
              ShonoWave
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Worldwide Radio</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* PWA Install Button */}
          {showInstallButton && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm border-0 transition-all duration-200"
              data-testid="button-install-pwa"
            >
              <i className="fas fa-download mr-1"></i>
              Install
            </Button>
          )}
          
          {/* Theme Toggle */}
          <Button
            onClick={toggleTheme}
            size="sm"
            variant="outline"
            className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-200"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <i className="fas fa-sun text-yellow-400 drop-shadow-sm"></i>
            ) : (
              <i className="fas fa-moon text-slate-600 drop-shadow-sm"></i>
            )}
          </Button>
          
          {/* Favorites Link */}
          <Link href="/favorites">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-200"
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
