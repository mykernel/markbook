import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
});
