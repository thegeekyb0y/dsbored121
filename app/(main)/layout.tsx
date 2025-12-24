"use client";

import React from "react";
import { AppBar } from "../components/AppBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AppBar />
      <main className="p-2 pt-8 md:pt-20 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
