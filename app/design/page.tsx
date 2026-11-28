import type { Metadata } from "next";

import { Showcase } from "./showcase";

export const metadata: Metadata = {
  title: "Design system — Kraked",
  description: "Internal component and token reference.",
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return <Showcase />;
}
