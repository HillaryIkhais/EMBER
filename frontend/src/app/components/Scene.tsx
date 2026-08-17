"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Sparkles, OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../hooks/useGameState";

function StylizedTree({ position, scale = 1, color = "#2d4c1e" }: { position: [number, number, number], scale?: number, color?: string }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1, 5]} />
        <meshStandardMaterial color="#3b2f2f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

function AncientWillow({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={2}>
      {/* Massive twisted trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 2, 7]} />
        <meshStandardMaterial color="#2a1f1f" roughness={0.9} />
      </mesh>
      {/* Glowing canopy */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[2.5, 8, 8]} />
        <meshStandardMaterial color="#ffd27a" emissive="#e8b923" emissiveIntensity={0.5} wireframe />
      </mesh>
      <pointLight position={[0, 3, 0]} color="#ffd27a" intensity={2} distance={10} />
      <Sparkles count={50} scale={5} size={6} speed={0.2} position={[0, 3, 0]} opacity={0.8} color="#ffffff" />
    </group>
  );
}

function MagicalCrystal({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#a388e8" emissive="#6a4cff" emissiveIntensity={2} roughness={0.2} />
        <pointLight color="#a388e8" intensity={1} distance={5} />
      </mesh>
    </Float>
  );
}

function DioramaIsland({ entriesCount, unlockedItems }: { entriesCount: number, unlockedItems: string[] }) {
  const isBarren = entriesCount === 0;
  
  return (
    <group position={[0, -2, 0]}>
      {/* The Top (Grass if evolved, Rock if barren) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[8, 8, 0.5, 8]} />
        <meshStandardMaterial color={isBarren ? "#1a1423" : "#1f3d2c"} roughness={1} flatShading />
      </mesh>
      
      {/* The Earth Base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[8, 4, 4, 8]} />
        <meshStandardMaterial color="#1a1423" roughness={1} flatShading />
      </mesh>

      {/* AUTOMATIC EVOLUTION: Only spawn if the user has journaled */}
      {!isBarren && (
        <>
          <StylizedTree position={[-3, 0, -4]} scale={1.5} color="#2d4c1e" />
          <StylizedTree position={[4, 0, -2]} scale={1.2} color="#1f3d2c" />
          <StylizedTree position={[2, 0, -5]} scale={0.8} color="#355c45" />
          
          <MagicalCrystal position={[0, 1.5, 0]} />
          <MagicalCrystal position={[-2, 1, 3]} />
        </>
      )}

      {/* STORE UNLOCKS */}
      {unlockedItems.includes("willow") && (
        <AncientWillow position={[0, 0, -1]} />
      )}
      
      {/* Small rocks (Always present) */}
      <mesh position={[1, 0.2, 4]} rotation={[0.2, 0.4, 0]}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#2a2a35" flatShading />
      </mesh>
      <mesh position={[-4, 0.3, -2]} rotation={[-0.2, 0.1, 0.5]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#2a2a35" flatShading />
      </mesh>
    </group>
  );
}

function SanctuaryEnvironment() {
  const { unlockedItems } = useGameState();
  const [entriesCount, setEntriesCount] = useState(0);

  useEffect(() => {
    fetch("/api/backend/world")
      .then(res => res.json())
      .then(data => setEntriesCount(data.length))
      .catch(console.error);
  }, []);

  const hasAurora = unlockedItems.includes("aurora");
  const skyColor = hasAurora ? "#1a0b2e" : "#0a0710";
  const fogColor = hasAurora ? "#2b1b54" : "#0a0710";

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[fogColor, 15, 40]} />

      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0.5} fade speed={0.5} />
      
      <DioramaIsland entriesCount={entriesCount} unlockedItems={unlockedItems} />

      <Sparkles count={200} scale={15} size={4} speed={0.4} position={[0, 2, 0]} opacity={0.6} color="#ffd27a" />
      <Sparkles count={300} scale={20} size={6} speed={0.3} position={[0, 0, 0]} opacity={0.4} color="#a388e8" />
      
      <ambientLight intensity={hasAurora ? 0.8 : 0.4} color={hasAurora ? "#a388e8" : "#2b1b54"} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} color="#e6d5ff" />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 5, 18], fov: 45 }}>
      <SanctuaryEnvironment />
      <OrbitControls 
        makeDefault 
        autoRotate 
        autoRotateSpeed={0.5} 
        enablePan={false}
        maxPolarAngle={Math.PI / 2 + 0.1}
        minDistance={5}
        maxDistance={25}
      />
    </Canvas>
  );
}
