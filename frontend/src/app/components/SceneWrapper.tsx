"use client";

import dynamic from "next/dynamic";

// Dynamically import the 3D Scene with ssr disabled to prevent hydration mismatch
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneWrapper() {
  return <Scene />;
}
