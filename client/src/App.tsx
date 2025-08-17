import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { AudioProvider } from "@/contexts/audio-context";
import { FavoritesProvider } from "./contexts/favorites-context";
import { AppHeader } from "./components/app-header";
import Home from "./pages/home";
import Favorites from "./pages/favorites";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-cyan-950/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10">
        <AppHeader />
        <main className="pb-20">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/country/:country">
              {(params) => <Home defaultCountry={params.country} />}
            </Route>
            <Route path="/favorites" component={Favorites} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <FavoritesProvider>
            <AudioProvider>
              <Toaster />
              <Router />
            </AudioProvider>
          </FavoritesProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
