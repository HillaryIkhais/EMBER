"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// The WebGL layer of Velaris: Deep stars and magical drifting wisps
function VelarisSky() {
  const skyRef = useRef<THREE.Group>(null);
  const wispsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (skyRef.current) {
      // Very slow, majestic rotation of the sky
      skyRef.current.rotation.y = clock.getElapsedTime() * 0.005;
      skyRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.002) * 0.05;
    }
    if (wispsRef.current) {
      // Wisps drift slowly upwards and sway
      wispsRef.current.position.y = (clock.getElapsedTime() * 0.2) % 10 - 5;
      wispsRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.5;
    }
  });

  return (
    <>
      <group ref={skyRef}>
        {/* Dense background stars, slightly tinted to match the night court */}
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0.5} fade speed={0.5} />
      </group>

      <group ref={wispsRef}>
        {/* Magical Wisps / Embers */}
        {/* Gold/Amber positive wisps */}
        <Sparkles count={150} scale={20} size={6} speed={0.4} opacity={0.4} color="#ffd27a" />
        {/* Violet/Indigo mysterious wisps */}
        <Sparkles count={250} scale={25} size={8} speed={0.3} opacity={0.3} color="#a388e8" />
        {/* Tiny ambient stardust */}
        <Sparkles count={500} scale={30} size={2} speed={0.1} opacity={0.1} color="#ffffff" />
      </group>

      {/* Cinematic ambient lighting */}
      <ambientLight intensity={0.2} color="#2b1b54" />
      <pointLight position={[0, -10, 5]} intensity={2} color="#a388e8" distance={20} />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      {/* We do NOT attach a background color to the canvas, so it remains transparent 
          and layers perfectly over our HTML twilight gradient */}
      <VelarisSky />
    </Canvas>
  );
}
