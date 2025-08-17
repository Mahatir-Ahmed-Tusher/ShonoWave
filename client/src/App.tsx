import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AudioProvider } from "@/contexts/audio-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import Home from "@/pages/home";
import Favorites from "@/pages/favorites";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/bd" component={() => <Home defaultCountry="Bangladesh" />} />
      <Route path="/in" component={() => <Home defaultCountry="India" />} />
      <Route path="/favorites" component={Favorites} />
      <Route component={NotFound} />
    </Switch>
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
