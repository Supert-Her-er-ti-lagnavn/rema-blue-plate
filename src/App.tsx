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
import ShoppingPage from "./pages/ShoppingPage";
import NotFound from "./pages/NotFound";
import { ShoppingProvider } from "@/contexts/ShoppingContext";

const queryClient = new QueryClient();

const App = () => {
  const [isShoppingMode, setIsShoppingMode] = useState(false);

  const handleModeToggle = (shoppingMode: boolean) => {
    setIsShoppingMode(shoppingMode);
    console.log(`Switched to ${shoppingMode ? 'Shopping' : 'Meal Planning'} mode`);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ShoppingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* Cross-state Header - appears on all pages */}
            <Header />
            <Routes>
              <Route path="/" element={
                isShoppingMode ? <ShoppingPage /> : <Index isShoppingMode={isShoppingMode} />
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Global Chat Widget - appears on all pages */}
            <ChatWidget />
            {/* Sticky Toggle at Bottom - appears on all pages */}
            <ToggleShopping onToggle={handleModeToggle} />
          </BrowserRouter>
        </TooltipProvider>
      </ShoppingProvider>
    </QueryClientProvider>
  );
};

export default App;
