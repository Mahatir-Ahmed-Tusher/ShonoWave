import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
          description: "Radio Stream has been installed successfully!",
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-slate-200 dark:border-dark-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-bd-primary to-in-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-radio text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-bold">Radio Stream</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* PWA Install Button */}
          {showInstallButton && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              data-testid="button-install-pwa"
            >
              <i className="fas fa-download mr-1"></i>
              Install
            </Button>
          )}
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-dark-card hover:bg-slate-200 dark:hover:bg-slate-600"
            data-testid="button-toggle-theme"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'} text-slate-600 dark:text-slate-300`}></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
