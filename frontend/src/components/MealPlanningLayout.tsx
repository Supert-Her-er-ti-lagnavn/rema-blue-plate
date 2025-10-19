import { ReactNode } from 'react';

interface MealPlanningLayoutProps {
  leftPanel: ReactNode;
  mainContent: ReactNode;
  rightPanel: ReactNode;
}

export function MealPlanningLayout({
  leftPanel,
  mainContent,
  rightPanel,
}: MealPlanningLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel - Family + Shopping Preview */}
      <aside className="w-80 lg:w-96 flex-shrink-0 overflow-y-auto bg-white border-r border-gray-200 p-4">
        <div className="space-y-6">
          {leftPanel}
        </div>
      </aside>

      {/* Main Content - Recipe Grid */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {mainContent}
      </main>

      {/* Right Panel - Chat Agent */}
      <aside className="w-80 lg:w-96 flex-shrink-0 overflow-hidden">
        {rightPanel}
      </aside>
    </div>
  );
}
