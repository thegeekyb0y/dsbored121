"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppBar } from "./AppBar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const hideAppBarRoutes = ["/login", "/signup", "/landing"];
  const shouldHideAppBar = hideAppBarRoutes.includes(pathname);

  return (
    <div className="min-h-screen">
      {!shouldHideAppBar && <AppBar />}
      <main
        className={`p-2 ${
          shouldHideAppBar ? "pt-2" : "pt-20"
        } max-w-7xl mx-auto`}
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
