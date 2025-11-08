"use client";

import React from "react";
import { AppBar } from "./AppBar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <AppBar />
      <main className="p-4 pt-10 max-w-7xl mx-auto">{children}</main>
    </div>
  );
};

export default AppLayout;
