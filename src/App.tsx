import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatWidget } from "@/components/ChatWidget";
import { ToggleShopping } from "@/components/ToggleShopping";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [currentMode, setCurrentMode] = useState<'planning' | 'shopping' | 'fridge'>('planning');

  const handleModeToggle = (mode: 'planning' | 'shopping' | 'fridge') => {
    setCurrentMode(mode);
    console.log(`Switched to ${mode} mode`);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Cross-state Header - appears on all pages */}
          <Header />
          
          <Routes>
            <Route path="/" element={<Index currentMode={currentMode} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Global Chat Widget - appears on all pages */}
          <ChatWidget />
          
          {/* Sticky Toggle at Bottom - appears on all pages */}
          <ToggleShopping onToggle={handleModeToggle} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
