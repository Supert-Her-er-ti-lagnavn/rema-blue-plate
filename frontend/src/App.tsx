import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ChatWidget } from "@/components/ChatWidget";
import SegmentedToggle from "@/components/ToggleShopping";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import ShoppingPage from "./pages/ShoppingPage";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { ShoppingProvider } from "@/contexts/ShoppingContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import FridgeMode from '@/components/FridgeMode';
import { NotificationProvider } from '@/contexts/NotificationContext';

const queryClient = new QueryClient();

const AppContent: React.FC<{
  currentMode: 'planning' | 'shopping' | 'fridge';
  onToggle: (mode: 'planning' | 'shopping' | 'fridge') => void;
}> = ({ currentMode, onToggle }) => {
  const location = useLocation();
  const hideToggle =
    location.pathname.startsWith('/notifications') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/profile');

  return (
    <>
      {/* Cross-state Header - appears on all pages */}
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            currentMode === 'shopping' ? (
              <ShoppingPage />
            ) : currentMode === 'fridge' ? (
              <FridgeMode />
            ) : (
              <Index currentMode={currentMode} />
            )
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Global Chat Widget - appears on all pages */}
      <ChatWidget />
      {/* Sticky Toggle at Bottom - appears on all pages except Notifications/Settings/Profile */}
      {!hideToggle && <SegmentedToggle onToggle={onToggle} />}
    </>
  );
};

const App = () => {
  const [currentMode, setCurrentMode] = useState<'planning' | 'shopping' | 'fridge'>('planning');

  const handleModeToggle = (mode: 'planning' | 'shopping' | 'fridge') => {
    setCurrentMode(mode);
    console.log(`Switched to ${mode} mode`);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <ShoppingProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent currentMode={currentMode} onToggle={handleModeToggle} />
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </ShoppingProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
};

export default App;
