'use client';

import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, LineMaterial } from '@react-three/drei';
import { INITIAL_SPIDER_NODES, INITIAL_SPIDER_EDGES } from '@/store';
import type { SpiderNode, SpiderEdge, Particle } from '@/types';
import { useSpiderStore, useDataStore } from '@/store';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

extend({ OrbitControls, LineMaterial });

const NODE_RADIUS = 1.8;
const JARVIS_RADIUS = 3.5;
const PARTICLE_COUNT = 60;
const RING_SEGMENTS = 64;

const NODE_COLORS: Record<string, THREE.Color> = {
  '#00e5ff': new THREE.Color(0x00e5ff),
  '#b87dff': new THREE.Color(0xb87dff),
  '#00ff88': new THREE.Color(0x00ff88),
  '#ff3366': new THREE.Color(0xff3366),
  '#ff8800': new THREE.Color(0xff8800),
};

const STATE_COLORS: Record<string, THREE.Color> = {
  idle: new THREE.Color(0x3a4d63),
  active: new THREE.Color(0x00e5ff),
  thinking: new THREE.Color(0xb87dff),
  communicating: new THREE.Color(0x00ff88),
  approving: new THREE.Color(0x00ff88),
  rejecting: new THREE.Color(0xff3366),
  executing: new THREE.Color(0xff8800),
};

const STATE_EMISSIVE_INTENSITY: Record<string, number> = {
  idle: 0.15,
  active: 0.8,
  thinking: 0.7,
  communicating: 0.7,
  approving: 0.8,
  rejecting: 0.9,
  executing: 0.75,
};

const AGENT_SPECIALIZATION_COLORS: Record<string, string> = {
  'Central Intelligence': '#00e5ff',
  'Market Discovery': '#00ff88',
  'Security Analysis': '#ff3366',
  'Price Action': '#b87dff',
  'Narrative Detection': '#ff8800',
  'Trade Strategy': '#00e5ff',
  'Risk Authority': '#ff3366',
  'Trade Execution': '#00ff88',
  'Portfolio Ops': '#b87dff',
};

function calculate3DPositions(): Record<string, [number, number, number]> {
  const positions: Record<string, [number, number, number]> = {};
  const center = [0, 0, 0];
  const ringRadius = 28;
  const verticalSpread = 12;
  
  positions['jarvis'] = center;
  
  const agents = [
    { id: 'token-scout', angle: -Math.PI / 2, vOffset: verticalSpread * 0.5 },
    { id: 'rug-detector', angle: -Math.PI / 4, vOffset: -verticalSpread * 0.5 },
    { id: 'technical-analyst', angle: 0, vOffset: -verticalSpread },
    { id: 'social-intelligence', angle: Math.PI / 4, vOffset: -verticalSpread },
    { id: 'strategy-analyst', angle: Math.PI / 2, vOffset: -verticalSpread * 0.5 },
    { id: 'risk-manager', angle: 3 * Math.PI / 4, vOffset: verticalSpread * 0.5 },
    { id: 'execution-trader', angle: Math.PI, vOffset: verticalSpread },
    { id: 'portfolio-manager', angle: -3 * Math.PI / 4, vOffset: verticalSpread },
  ];
  
  agents.forEach(({ id, angle, vOffset }) => {
    positions[id] = [
      Math.cos(angle) * ringRadius,
      vOffset,
      Math.sin(angle) * ringRadius,
    ];
  });
  
  return positions;
}

const NODE_POSITIONS_3D = calculate3DPositions();

function JarvisCore({ 
  node, 
  onClick, 
  onHover, 
  onHoverEnd,
  isHovered,
  isSelected 
}: { 
  node: SpiderNode;
  onClick: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
  isHovered: boolean;
  isSelected: boolean;
}) {
  const coreRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const pulseRef = useRef(0);
  const { camera } = useThree();
  
  const baseColor = NODE_COLORS[node.color] || new THREE.Color(0x00e5ff);
  const stateColor = STATE_COLORS[node.state] || baseColor;
  const emissiveIntensity = STATE_EMISSIVE_INTENSITY[node.state] || 0.5;

  useFrame((_, delta) => {
    if (!coreRef.current) return;
    
    const time = Date.now() * 0.001;
    pulseRef.current += delta;
    
    coreRef.current.rotation.y += delta * 0.08;
    coreRef.current.rotation.x += delta * 0.03;
    coreRef.current.rotation.z += delta * 0.02;
    
    const pulse = Math.sin(pulseRef.current * 2) * 0.15 + 0.85;
    const hoverBoost = isHovered ? 0.3 : 0;
    const selectBoost = isSelected ? 0.2 : 0;
    
    coreRef.current.children.forEach((child, idx) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
        const ringPulse = Math.sin(pulseRef.current * 1.5 + idx * 0.8) * 0.2 + 0.8;
        child.material.emissiveIntensity = THREE.MathUtils.lerp(
          child.material.emissiveIntensity,
          (emissiveIntensity + hoverBoost + selectBoost) * ringPulse,
          delta * 4
        );
        
        if (idx < 3) {
          child.rotation.y += delta * (0.15 + idx * 0.05) * (idx % 2 === 0 ? 1 : -1);
          child.rotation.x += delta * (0.08 + idx * 0.03) * (idx % 2 === 0 ? 1 : -1);
        }
      }
    });
    
    coreRef.current.scale.setScalar(1 + Math.sin(pulseRef.current * 1.5) * 0.02);
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick();
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    onHover();
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    onHoverEnd();
  };

  return (
    <group ref={coreRef} position={node.position as [number, number, number]} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[JARVIS_RADIUS * 1.6, 32, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.08 + (isHovered ? 0.1 : 0)}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Rotating rings */}
      {[0, 1, 2].map((ringIdx) => (
        <mesh key={`ring-${ringIdx}`}>
          <torusGeometry args={[JARVIS_RADIUS * (1.15 + ringIdx * 0.18), 0.08, 16, RING_SEGMENTS]} />
          <meshPhysicalMaterial
            color={baseColor}
            emissive={stateColor}
            emissiveIntensity={emissiveIntensity}
            metalness={0.2}
            roughness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transparent
            opacity={0.6 - ringIdx * 0.1}
            side={THREE.DoubleSide}
          />
          <rotation>
            {ringIdx === 0 ? Math.PI / 2 : 0}
            {ringIdx === 1 ? 0 : Math.PI / 2}
            {ringIdx === 2 ? Math.PI / 4 : 0}
          </rotation>
        </mesh>
      ))}
      
      {/* Inner core icosahedron */}
      <mesh>
        <icosahedronGeometry args={[JARVIS_RADIUS * 0.7, 2]} />
        <meshPhysicalMaterial
          color={baseColor}
          emissive={stateColor}
          emissiveIntensity={emissiveIntensity * 1.5}
          metalness={0.4}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transmission={0.4}
          thickness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Central energy sphere */}
      <mesh>
        <sphereGeometry args={[JARVIS_RADIUS * 0.35, 32, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Particle field around core */}
      <CoreParticleField coreRadius={JARVIS_RADIUS} color={baseColor} />
    </group>
  );
}

function CoreParticleField({ coreRadius, color }: { coreRadius: number; color: THREE.Color }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;
  
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const speeds = new Float32Array(count);
    const distances = new Float32Array(count);
    const angles = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const distance = coreRadius * 0.8 + Math.random() * coreRadius * 1.5;
      const angle = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      distances[i] = distance;
      angles[i] = angle;
      speeds[i] = 0.05 + Math.random() * 0.15;
      sizes[i] = 0.08 + Math.random() * 0.15;
      alphas[i] = 0.2 + Math.random() * 0.5;
      
      positions[i * 3] = distance * Math.sin(phi) * Math.cos(angle);
      positions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(angle);
      positions[i * 3 + 2] = distance * Math.cos(phi);
    }
    
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    g.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    g.setAttribute('distance', new THREE.BufferAttribute(distances, 1));
    g.setAttribute('angle', new THREE.BufferAttribute(angles, 1));
    
    return g;
  }, [coreRadius]);
  
  const material = useMemo(() => 
    new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: false,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }),
    []
  );
  
  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const speeds = geometry.getAttribute('speed') as THREE.BufferAttribute;
    const distances = geometry.getAttribute('distance') as THREE.BufferAttribute;
    const angles = geometry.getAttribute('angle') as THREE.BufferAttribute;
    
    for (let i = 0; i < count; i++) {
      const speed = speeds.getX(i);
      const distance = distances.getX(i);
      let angle = angles.getX(i) + speed * delta;
      
      const phi = Math.acos(2 * (i / count) - 1);
      
      positions.setXYZ(
        i,
        distance * Math.sin(phi) * Math.cos(angle),
        distance * Math.sin(phi) * Math.sin(angle),
        distance * Math.cos(phi)
      );
      
      angles.setX(i, angle);
    }
    
    positions.needsUpdate = true;
    angles.needsUpdate = true;
  });
  
  return <points ref={particlesRef} geometry={geometry} material={material} />;
}

function AgentNode({ 
  node, 
  onClick, 
  onHover, 
  onHoverEnd,
  isHovered,
  isSelected 
}: { 
  node: SpiderNode;
  onClick: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
  isHovered: boolean;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);
  
  const baseColor = NODE_COLORS[node.color] || new THREE.Color(0x00e5ff);
  const stateColor = STATE_COLORS[node.state] || baseColor;
  const emissiveIntensity = STATE_EMISSIVE_INTENSITY[node.state] || 0.3;

  useFrame((_, delta) => {
    if (!meshRef.current || !ringRef.current) return;
    
    const time = Date.now() * 0.001;
    pulseRef.current += delta;
    
    meshRef.current.rotation.y += delta * 0.3;
    meshRef.current.rotation.x += delta * 0.15;
    
    const pulse = Math.sin(pulseRef.current * 3 + node.position[0]) * 0.5 + 0.5;
    const hoverBoost = isHovered ? 0.4 : 0;
    const selectBoost = isSelected ? 0.3 : 0;
    const targetIntensity = emissiveIntensity * 0.8 + pulse * 0.4 + hoverBoost + selectBoost;
    
    if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        meshRef.current.material.emissiveIntensity,
        targetIntensity,
        delta * 6
      );
    }
    
    if (ringRef.current.material instanceof THREE.MeshBasicMaterial) {
      ringRef.current.material.opacity = THREE.MathUtils.lerp(
        ringRef.current.material.opacity,
        0.3 + pulse * 0.3 + (isHovered ? 0.3 : 0) + (isSelected ? 0.2 : 0),
        delta * 4
      );
      ringRef.current.scale.setScalar(1 + Math.sin(pulseRef.current * 2) * 0.1 + (isHovered ? 0.2 : 0));
    }
    
    const floatOffset = Math.sin(pulseRef.current * 1.2 + node.position[0] * 0.1) * 0.15;
    meshRef.current.position.y = node.position[1] + floatOffset;
    if (ringRef.current) ringRef.current.position.y = node.position[1] + floatOffset;
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick();
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    onHover();
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    onHoverEnd();
  };

  const geometry = useMemo(() => new THREE.OctahedronGeometry(NODE_RADIUS, 1), []);
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(NODE_RADIUS * 1.4, 0.06, 12, 32), []);

  return (
    <group position={node.position as [number, number, number]} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      {/* Outer pulse ring */}
      <mesh ref={ringRef} geometry={ringGeometry} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Node mesh */}
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        castShadow 
        receiveShadow
      >
        <meshPhysicalMaterial
          color={baseColor}
          emissive={stateColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.35}
          roughness={0.3}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <octahedronGeometry args={[NODE_RADIUS * 0.5, 0]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ConnectionEdge({ 
  edge, 
  sourcePos, 
  targetPos,
  sourceColor,
  targetColor 
}: { 
  edge: SpiderEdge;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  sourceColor: THREE.Color;
  targetColor: THREE.Color;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const glowRef = useRef<THREE.Line>(null);
  const pulseRef = useRef(0);
  
  const midPoint = new THREE.Vector3()
    .addVectors(
      new THREE.Vector3(...sourcePos),
      new THREE.Vector3(...targetPos)
    )
    .multiplyScalar(0.5);
  
  const distance = new THREE.Vector3(...sourcePos).distanceTo(new THREE.Vector3(...targetPos));
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...sourcePos),
    new THREE.Vector3(midPoint.x, midPoint.y + distance * 0.15, midPoint.z),
    new THREE.Vector3(...targetPos)
  );

  const geometry = useMemo(() => {
    const points = curve.getPoints(64);
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [sourcePos, targetPos]);

  const material = useMemo(() => 
    new LineMaterial({
      color: sourceColor,
      linewidth: 0.003,
      dashed: false,
      transparent: true,
      opacity: 0.4 + edge.intensity * 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [sourceColor, edge.intensity]
  );

  const glowMaterial = useMemo(() => 
    new LineMaterial({
      color: sourceColor,
      linewidth: 0.012,
      transparent: true,
      opacity: 0.15 + edge.intensity * 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [sourceColor, edge.intensity]
  );

  useFrame((_, delta) => {
    pulseRef.current += delta;
    const pulse = Math.sin(pulseRef.current * 1.5) * 0.5 + 0.5;
    
    if (material && lineRef.current) {
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        0.3 + edge.intensity * 0.5 + pulse * 0.1,
        delta * 4
      );
      material.color.lerpColors(sourceColor, targetColor, pulse * 0.3 + 0.35);
    }
    
    if (glowMaterial && glowRef.current) {
      glowMaterial.opacity = THREE.MathUtils.lerp(
        glowMaterial.opacity,
        0.1 + edge.intensity * 0.2 + pulse * 0.05,
        delta * 3
      );
    }
  });

  return (
    <group>
      <line2 ref={glowRef} geometry={geometry} material={glowMaterial} />
      <line2 ref={lineRef} geometry={geometry} material={material} />
    </group>
  );
}

function FlowParticles({ 
  edge, 
  sourcePos, 
  targetPos,
  sourceColor,
  targetColor 
}: { 
  edge: SpiderEdge;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  sourceColor: THREE.Color;
  targetColor: THREE.Color;
}) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const progress = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const delays = new Float32Array(PARTICLE_COUNT);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      progress[i] = Math.random();
      speeds[i] = 0.08 + Math.random() * 0.25;
      delays[i] = Math.random() * 2;
      sizes[i] = 0.12 + Math.random() * 0.25;
      alphas[i] = 0;
    }
    
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    g.setAttribute('progress', new THREE.BufferAttribute(progress, 1));
    g.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    g.setAttribute('delay', new THREE.BufferAttribute(delays, 1));
    
    return g;
  }, []);

  const material = useMemo(() => 
    new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }),
    []
  );

  useFrame((_, delta) => {
    if (!particlesRef.current || edge.particles.length === 0) return;
    
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colors = geometry.getAttribute('color') as THREE.BufferAttribute;
    const alphas = geometry.getAttribute('alpha') as THREE.BufferAttribute;
    const progressAttr = geometry.getAttribute('progress') as THREE.BufferAttribute;
    const speeds = geometry.getAttribute('speed') as THREE.BufferAttribute;
    const delays = geometry.getAttribute('delay') as THREE.BufferAttribute;
    const sizes = geometry.getAttribute('size') as THREE.BufferAttribute;
    
    const sourceVec = new THREE.Vector3(...sourcePos);
    const targetVec = new THREE.Vector3(...targetPos);
    const midPoint = sourceVec.clone().add(targetVec).multiplyScalar(0.5);
    midPoint.y += sourceVec.distanceTo(targetVec) * 0.15;
    
    const curve = new THREE.QuadraticBezierCurve3(sourceVec, midPoint, targetVec);
    const hasActiveFlow = edge.particles.length > 0 && edge.intensity > 0.1;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let p = progressAttr.getX(i);
      const speed = speeds.getX(i);
      const delay = delays.getX(i);
      
      // Check for active particle from edge
      const activeParticle = edge.particles.find(part => 
        Math.abs(part.progress - p) < 0.08
      );
      
      if (activeParticle && hasActiveFlow) {
        p = activeParticle.progress;
      } else if (hasActiveFlow) {
        p += speed * delta;
        if (p > 1) {
          p = 0;
          delays.setX(i, Math.random() * 1.5);
        }
      }
      
      progressAttr.setX(i, p);
      
      const point = curve.getPoint(p);
      positions.setXYZ(i, point.x, point.y, point.z);
      
      // Color interpolation with pulse
      const colorPulse = Math.sin(Date.now() * 0.003 + i * 0.5) * 0.3 + 0.7;
      const color = sourceColor.clone().lerp(targetColor, p).multiplyScalar(colorPulse);
      colors.setXYZ(i, color.r, color.g, color.b);
      
      // Alpha based on progress and activity
      let alpha = 0;
      if (p < 0.1) alpha = p * 10;
      else if (p > 0.9) alpha = (1 - p) * 10;
      else alpha = 1;
      
      if (activeParticle && hasActiveFlow) alpha = 1;
      
      // Boost when edge has active flow
      if (hasActiveFlow) alpha *= 1.5;
      
      alphas.setX(i, Math.min(alpha, 1));
      sizes.setX(i, (activeParticle ? 2 : 1) * sizes.getX(i) * alpha);
    }
    
    positions.needsUpdate = true;
    colors.needsUpdate = true;
    alphas.needsUpdate = true;
    sizes.needsUpdate = true;
    progressAttr.needsUpdate = true;
  });

  return <points ref={particlesRef} geometry={geometry} material={material} />;
}

function NodeLabel({ 
  node, 
  isJarvis,
  isHovered,
  isSelected 
}: { 
  node: SpiderNode; 
  isJarvis: boolean; 
  isHovered: boolean;
  isSelected: boolean;
}) {
  const { camera } = useThree();
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0, visible: false });
  const vector = new THREE.Vector3(...node.position);
  
  useFrame(() => {
    const pos = vector.clone().project(camera);
    setScreenPos({
      x: (pos.x * 0.5 + 0.5) * window.innerWidth,
      y: (-pos.y * 0.5 + 0.5) * window.innerHeight,
      visible: pos.z < 1,
    });
  });

  if (!screenPos.visible) return null;

  return (
    <motion.div
      className={clsx(
        'fixed pointer-events-none z-10',
        'text-xs font-mono px-3 py-1.5 rounded-lg',
        'glass-strong border',
        'whitespace-nowrap transition-all duration-300',
        isJarvis ? 'border-cyan/60 text-gradient-cyan' : 'border-hive-border/50 text-hive-text',
        isHovered && 'scale-105',
        isSelected && 'ring-2 ring-cyan/50'
      )}
      style={{
        left: screenPos.x,
        top: screenPos.y - (isJarvis ? 60 : 40),
        transform: 'translate(-50%, -100%)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center gap-2">
        <span 
          className={clsx('w-2 h-2 rounded-full', isJarvis ? 'bg-cyan animate-pulse' : '')}
          style={{ backgroundColor: node.color }}
        />
        <span className={isJarvis ? 'font-bold' : 'font-medium'}>{node.name}</span>
      </div>
      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-hive-textDim">
        <span>{node.role}</span>
        <span className="px-1.5 py-0.5 rounded-full bg-hive-bg/80 border border-hive-border/30 font-mono">
          {node.state.toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
}

function NetworkBackground() {
  return (
    <>
      {/* Deep space background */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial
          color="#020307"
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Subtle grid plane */}
      <gridHelper args={[200, 40, 'rgba(0,229,255,0.05)', 'rgba(184,125,255,0.05)']} position={[0, -40, 0]} />
      
      {/* Radial gradient rings on ground */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`ground-ring-${i}`} position={[0, -39.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[28 + i * 8, 32 + i * 8, 64]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? 0x00e5ff : 0xb87dff}
            transparent
            opacity={0.02}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      
      {/* Ambient volumetric light shafts */}
      <VolumetricLightShafts />
    </>
  );
}

function VolumetricLightShafts() {
  const shaftsRef = useRef<THREE.Mesh[]>([]);
  
  const geometry = useMemo(() => {
    const g = new THREE.ConeGeometry(2, 60, 8, 1, true);
    g.translate(0, -30, 0);
    return g;
  }, []);
  
  const material = useMemo(() => 
    new THREE.MeshBasicMaterial({
      color: '#00e5ff',
      transparent: true,
      opacity: 0.015,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    []
  );
  
  useFrame((_, delta) => {
    const time = Date.now() * 0.001;
    shaftsRef.current.forEach((shaft, idx) => {
      shaft.rotation.y += delta * 0.02 * (idx % 2 === 0 ? 1 : -1);
      shaft.material.opacity = 0.01 + Math.sin(time * 0.3 + idx) * 0.005;
    });
  });
  
  return (
    <group ref={shaftsRef}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} geometry={geometry} material={material} rotation={[0, i * Math.PI / 3, 0]} />
      ))}
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 800;
  
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const ages = new Float32Array(count);
    
    const palette = [
      new THREE.Color(0x00e5ff),
      new THREE.Color(0xb87dff),
      new THREE.Color(0x00ff88),
      new THREE.Color(0xff8800),
    ];
    
    for (let i = 0; i < count; i++) {
      const radius = 20 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 20;
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = 0.05 + Math.random() * 0.3;
      
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      alphas[i] = 0.1 + Math.random() * 0.4;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5 + 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      
      lifetimes[i] = 20 + Math.random() * 40;
      ages[i] = Math.random() * lifetimes[i];
    }
    
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    g.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    g.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    g.setAttribute('age', new THREE.BufferAttribute(ages, 1));
    
    return g;
  }, []);
  
  const material = useMemo(() => 
    new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }),
    []
  );
  
  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const velocities = geometry.getAttribute('velocity') as THREE.BufferAttribute;
    const alphas = geometry.getAttribute('alpha') as THREE.BufferAttribute;
    const ages = geometry.getAttribute('age') as THREE.BufferAttribute;
    const lifetimes = geometry.getAttribute('lifetime') as THREE.BufferAttribute;
    
    for (let i = 0; i < count; i++) {
      let age = ages.getX(i) + delta;
      const lifetime = lifetimes.getX(i);
      
      if (age > lifetime) {
        age = 0;
        const radius = 20 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions.setXYZ(
          i,
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta) - 20,
          radius * Math.cos(phi)
        );
        
        velocities.setXYZ(
          i,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5 + 0.1,
          (Math.random() - 0.5) * 0.5
        );
      }
      
      positions.setXYZ(
        i,
        positions.getX(i) + velocities.getX(i) * delta * 10,
        positions.getY(i) + velocities.getY(i) * delta * 10,
        positions.getZ(i) + velocities.getZ(i) * delta * 10
      );
      
      const lifeRatio = age / lifetime;
      alphas.setX(i, Math.sin(lifeRatio * Math.PI) * 0.5);
      
      ages.setX(i, age);
    }
    
    positions.needsUpdate = true;
    alphas.needsUpdate = true;
    ages.needsUpdate = true;
  });
  
  return <points ref={particlesRef} geometry={geometry} material={material} />;
}

export function SpiderHiveCanvas({ onNodeClick }: { onNodeClick: (node: SpiderNode) => void }) {
  const { nodes, edges, hoveredNode, selectedNode, cameraPosition, cameraTarget } = useSpiderStore();
  const { agents } = useDataStore();
  const { camera, controls } = useThree();
  
  const [isInteracting, setIsInteracting] = useState(false);

  // Sync agent states to spider nodes
  useEffect(() => {
    const state = useSpiderStore.getState();
    
    const mapAgentStatusToNodeState = (status: string): SpiderNode['state'] => {
      switch (status) {
        case 'analyzing': return 'thinking';
        case 'communicating': return 'communicating';
        case 'approving': return 'approving';
        case 'rejecting': return 'rejecting';
        case 'executing': return 'executing';
        default: return 'idle';
      }
    };
    
    agents.forEach(agent => {
      const node = state.nodes.find(n => n.id === agent.id);
      const mappedState = mapAgentStatusToNodeState(agent.status);
      if (node && node.state !== mappedState) {
        state.updateNodeState(agent.id, mappedState);
      }
    });
  }, [agents]);

  // Update camera position in store when user interacts
  useFrame(() => {
    if (controls && controls.enabled) {
      useSpiderStore.getState().setCameraPosition([
        camera.position.x,
        camera.position.y,
        camera.position.z,
      ]);
      useSpiderStore.getState().setCameraTarget([
        controls.target.x,
        controls.target.y,
        controls.target.z,
      ]);
    }
  });

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ 
          position: cameraPosition, 
          fov: 50, 
          near: 0.1, 
          far: 500 
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        gl={{ 
          antialias: true, 
          alpha: true, 
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
        }}
        shadows={false}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
      >
        <color attach="background" args={['#020307']} />
        <fog attach="fog" args={['#020307', 50, 300]} />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.4} color="#0a1528" />
        <directionalLight position={[30, 50, 30]} intensity={0.6} color="#00e5ff" />
        <directionalLight position={[-30, -50, -30]} intensity={0.4} color="#b87dff" />
        <pointLight position={[0, 0, 0]} color="#00e5ff" intensity={0.5} distance={80} decay={1.5} />
        <pointLight position={[0, 0, 0]} color="#b87dff" intensity={0.3} distance={80} decay={1.5} />
        
        {/* Hemisphere light for subtle fill */}
        <hemisphereLight groundColor="#0a0f1a" skyColor="#00e5ff" intensity={0.3} />
        
        {/* Background elements */}
        <NetworkBackground />
        <FloatingParticles />
        
        {/* Edges with particles */}
        {edges.map((edge, idx) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;
          
          const sourceColor = NODE_COLORS[sourceNode.color] || new THREE.Color(0x00e5ff);
          const targetColor = NODE_COLORS[targetNode.color] || new THREE.Color(0xb87dff);
          
          return (
            <React.Fragment key={`edge-${idx}`}>
              <ConnectionEdge 
                edge={edge} 
                sourcePos={sourceNode.position} 
                targetPos={targetNode.position}
                sourceColor={sourceColor}
                targetColor={targetColor}
              />
              <FlowParticles 
                edge={edge} 
                sourcePos={sourceNode.position} 
                targetPos={targetNode.position}
                sourceColor={sourceColor}
                targetColor={targetColor}
              />
            </React.Fragment>
          );
        })}
        
        {/* Nodes */}
        {nodes.map((node) => {
          const isJarvis = node.id === 'jarvis';
          const isHovered = hoveredNode === node.id;
          const isSelected = selectedNode === node.id;
          
          return (
            <React.Fragment key={node.id}>
              {isJarvis ? (
                <JarvisCore
                  node={node}
                  onClick={() => onNodeClick(node)}
                  onHover={() => useSpiderStore.getState().setHoveredNode(node.id)}
                  onHoverEnd={() => useSpiderStore.getState().setHoveredNode(null)}
                  isHovered={isHovered}
                  isSelected={isSelected}
                />
              ) : (
                <AgentNode
                  node={node}
                  onClick={() => onNodeClick(node)}
                  onHover={() => useSpiderStore.getState().setHoveredNode(node.id)}
                  onHoverEnd={() => useSpiderStore.getState().setHoveredNode(null)}
                  isHovered={isHovered}
                  isSelected={isSelected}
                />
              )}
              <NodeLabel 
                node={node} 
                isJarvis={isJarvis}
                isHovered={isHovered}
                isSelected={isSelected}
              />
            </React.Fragment>
          );
        })}
        
        {/* Orbit controls for zoom/pan */}
        <OrbitControls
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          zoomSpeed={1.2}
          minZoom={0.5}
          maxZoom={3}
          enablePan={true}
          panSpeed={0.8}
          enableRotate={true}
          rotateSpeed={0.6}
          autoRotate={!isInteracting}
          autoRotateSpeed={0.3}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={cameraTarget}
        />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 px-4 glass px-4 py-3 rounded-xl border-hive-border/50">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-hive-text font-semibold text-sm">AGENTS</span>
          {nodes.map(node => (
            <span key={node.id} className="flex items-center gap-1.5 text-sm">
              <span 
                className={clsx('w-2.5 h-2.5 rounded-full', node.id === 'jarvis' && 'animate-pulse')}
                style={{ backgroundColor: node.color }}
              />
              <span className={clsx('font-medium', node.id === 'jarvis' && 'text-gradient-cyan')}>
                {node.name}
              </span>
            </span>
          ))}
        </div>
      </div>
      
      {/* Interaction hint */}
      <div className="absolute top-4 right-4 glass px-4 py-2 rounded-xl border-hive-border/50 text-hive-textDim text-xs font-mono hidden md:block">
        Drag to rotate • Scroll to zoom • Right-click to pan • Click node for details
      </div>
    </div>
  );
}

export function SpiderHive({ onNodeClick }: { onNodeClick: (node: SpiderNode) => void }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full glass flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-cyan/50 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-4 border-2 border-purple/50 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
            <div className="absolute inset-8 border-2 border-green/50 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan to-purple rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-hive-textMuted text-lg font-medium">Initializing Hive Network</p>
          <p className="text-hive-textDim text-sm mt-1">Establishing agent connections...</p>
        </div>
        <NetworkBackground />
      </div>
    );
  }

  return <SpiderHiveCanvas onNodeClick={onNodeClick} />;
}