import React from "react";
import OrbitalBackground from "./OrbitalBackground";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

interface AppLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showBackButton = true,
  title = "Orbital Lending",
}) => {
  return (
    <div className="min-h-screen text-white font-inter relative ">
      <OrbitalBackground />

      <AppHeader showBackButton={showBackButton} title={title} />

      <main className="relative z-10">{children}</main>

      <AppFooter />
    </div>
  );
};

export default AppLayout;
