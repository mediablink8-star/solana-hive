'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { INITIAL_SPIDER_NODES, INITIAL_SPIDER_EDGES } from '@/store';
import type { SpiderNode, SpiderEdge, Particle } from '@/types';
import { useSpiderStore, useDataStore } from '@/store';
import { clsx } from 'clsx';

const NODE_RADIUS = 1.5;
const JARVIS_RADIUS = 3;
const PARTICLE_COUNT = 50;

const colors: Record<string, THREE.Color> = {
  '#00e5ff': new THREE.Color(0x00e5ff),
  '#b87dff': new THREE.Color(0xb87dff),
  '#00ff88': new THREE.Color(0x00ff88),
  '#ff3366': new THREE.Color(0xff3366),
  '#ff8800': new THREE.Color(0xff8800),
};

const stateColors: Record<string, THREE.Color> = {
  idle: new THREE.Color(0x4a5d73),
  active: new THREE.Color(0x00e5ff),
  thinking: new THREE.Color(0xb87dff),
  communicating: new THREE.Color(0x00ff88),
  approving: new THREE.Color(0x00ff88),
  rejecting: new THREE.Color(0xff3366),
  executing: new THREE.Color(0xff8800),
};

function NodeMesh({ node, isJarvis, onClick, onHover, onHoverEnd }: {
  node: SpiderNode;
  isJarvis: boolean;
  onClick: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { nodes, hoveredNode } = useSpiderStore();
  const { scene } = useThree();
  
  const radius = isJarvis ? JARVIS_RADIUS : NODE_RADIUS;
  const segments = isJarvis ? 32 : 16;
  const pulseIntensity = node.pulseIntensity || 0;
  const isHovered = hoveredNode === node.id;
  const isSelected = false; // Could add selection logic

  const geometry = useMemo(() => 
    isJarvis 
      ? new THREE.IcosahedronGeometry(radius, 2)
      : new THREE.OctahedronGeometry(radius, 1),
    [isJarvis, radius]
  );

  const baseColor = colors[node.color] || new THREE.Color(0x00e5ff);
  const stateColor = stateColors[node.state] || baseColor;

  const material = useMemo(() => 
    new THREE.MeshPhysicalMaterial({
      color: baseColor,
      emissive: stateColor,
      emissiveIntensity: pulseIntensity * 0.8 + (isHovered ? 0.5 : 0),
      metalness: 0.3,
      roughness: 0.4,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      transmission: isJarvis ? 0.3 : 0,
      thickness: isJarvis ? 0.5 : 0,
      transparent: true,
      opacity: isJarvis ? 0.85 : 0.95,
    }),
    [baseColor, stateColor, pulseIntensity, isHovered, isJarvis]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const time = Date.now() * 0.001;
    const pulse = Math.sin(time * 2 + node.position[0]) * 0.5 + 0.5;
    const targetIntensity = pulseIntensity * 0.8 + pulse * 0.3 + (isHovered ? 0.5 : 0);
    
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      targetIntensity,
      delta * 5
    );

    if (isJarvis) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
    } else {
      meshRef.current.rotation.y += delta * 0.2;
    }

    // Float animation
    const floatOffset = Math.sin(time * 1.5 + node.position[0]) * 0.15;
    meshRef.current.position.y = node.position[1] + floatOffset;
  });

  const handleClick = (event: React.MouseEvent<THREE.Mesh>) => {
    event.stopPropagation();
    onClick();
  };

  const handlePointerOver = (event: React.PointerEvent<THREE.Mesh>) => {
    event.stopPropagation();
    onHover();
  };

  const handlePointerOut = (event: React.PointerEvent<THREE.Mesh>) => {
    event.stopPropagation();
    onHoverEnd();
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={node.position as [number, number, number]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      {isJarvis && (
        <>
          <mesh
            geometry={new THREE.IcosahedronGeometry(radius * 1.3, 1)}
            material={new THREE.MeshBasicMaterial({
              color: baseColor,
              transparent: true,
              opacity: 0.1,
              side: THREE.BackSide,
            })}
            position={node.position as [number, number, number]}
          />
          <mesh
            geometry={new THREE.TorusGeometry(radius * 1.1, 0.05, 8, 32)}
            material={new THREE.MeshBasicMaterial({
              color: baseColor,
              transparent: true,
              opacity: 0.4,
            })}
            position={node.position as [number, number, number]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <mesh
            geometry={new THREE.TorusGeometry(radius * 1.1, 0.05, 8, 32)}
            material={new THREE.MeshBasicMaterial({
              color: baseColor,
              transparent: true,
              opacity: 0.4,
            })}
            position={node.position as [number, number, number]}
            rotation={[0, Math.PI / 2, 0]}
          />
        </>
      )}
    </mesh>
  );
}

function EdgeLine({ edge, sourcePos, targetPos }: {
  edge: SpiderEdge;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
}) {
  const lineRef = useRef<THREE.Line>(null);
  const { scene } = useThree();
  
  const midPoint = new THREE.Vector3()
    .addVectors(
      new THREE.Vector3(...sourcePos),
      new THREE.Vector3(...targetPos)
    )
    .multiplyScalar(0.5);

  const distance = new THREE.Vector3(...sourcePos).distanceTo(new THREE.Vector3(...targetPos));
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...sourcePos),
    new THREE.Vector3(midPoint.x, midPoint.y + distance * 0.1, midPoint.z),
    new THREE.Vector3(...targetPos)
  );

  const points = curve.getPoints(32);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), []);
  
  const sourceNode = useSpiderStore.getState().nodes.find(n => n.id === edge.source);
  const targetNode = useSpiderStore.getState().nodes.find(n => n.id === edge.target);
  const sourceColor = sourceNode ? colors[sourceNode.color] : new THREE.Color(0x00e5ff);
  const targetColor = targetNode ? colors[targetNode.color] : new THREE.Color(0xb87dff);

  const material = useMemo(() => 
    new THREE.LineDashedMaterial({
      color: sourceColor,
      dashSize: 0.5,
      gapSize: 0.3,
      transparent: true,
      opacity: 0.3 + edge.intensity * 0.5,
      linewidth: 2,
    }),
    [sourceColor, edge.intensity]
  );

  useFrame((_, delta) => {
    if (!lineRef.current) return;
    
    const time = Date.now() * 0.001;
    material.dashOffset = (time * 0.5) % 1;
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      0.2 + edge.intensity * 0.6,
      delta * 3
    );
  });

  return (
    <line
      ref={lineRef}
      geometry={geometry}
      material={material}
      computeLineDistances
    />
  );
}

function Particles({ edge, sourcePos, targetPos }: {
  edge: SpiderEdge;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const { nodes } = useSpiderStore();
  
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const progress = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      progress[i] = Math.random();
      speeds[i] = 0.1 + Math.random() * 0.3;
      sizes[i] = 0.15 + Math.random() * 0.2;
      alphas[i] = 0;
    }
    
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    g.setAttribute('progress', new THREE.BufferAttribute(progress, 1));
    g.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    
    return g;
  }, []);

  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  const sourceColor = sourceNode ? colors[sourceNode.color] : new THREE.Color(0x00e5ff);
  const targetColor = targetNode ? colors[targetNode.color] : new THREE.Color(0xb87dff);

  const material = useMemo(() => 
    new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
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
    const sizes = geometry.getAttribute('size') as THREE.BufferAttribute;
    
    const sourceVec = new THREE.Vector3(...sourcePos);
    const targetVec = new THREE.Vector3(...targetPos);
    const midPoint = sourceVec.clone().add(targetVec).multiplyScalar(0.5);
    midPoint.y += sourceVec.distanceTo(targetVec) * 0.1;
    
    const curve = new THREE.QuadraticBezierCurve3(sourceVec, midPoint, targetVec);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let p = progressAttr.getX(i);
      const speed = speeds.getX(i);
      
      // Check if there's an active particle on this edge
      const activeParticle = edge.particles.find(part => 
        Math.abs(part.progress - p) < 0.05
      );
      
      if (activeParticle) {
        p = activeParticle.progress;
      } else {
        p += speed * delta;
        if (p > 1) p = 0;
      }
      
      progressAttr.setX(i, p);
      
      const point = curve.getPoint(p);
      positions.setXYZ(i, point.x, point.y, point.z);
      
      // Color interpolation
      const color = sourceColor.clone().lerp(targetColor, p);
      colors.setXYZ(i, color.r, color.g, color.b);
      
      // Alpha based on progress (fade in/out)
      let alpha = 0;
      if (p < 0.1) alpha = p * 10;
      else if (p > 0.9) alpha = (1 - p) * 10;
      else alpha = 1;
      
      // Boost alpha for active particles
      if (activeParticle) alpha = 1;
      
      alphas.setX(i, alpha);
      sizes.setX(i, activeParticle ? sizes.getX(i) * 2 : sizes.getX(i));
    }
    
    positions.needsUpdate = true;
    colors.needsUpdate = true;
    alphas.needsUpdate = true;
    sizes.needsUpdate = true;
    progressAttr.needsUpdate = true;
  });

  return <points ref={particlesRef} geometry={geometry} material={material} />;
}

function NodeLabel({ node, isJarvis }: { node: SpiderNode; isJarvis: boolean }) {
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
    <div
      className={clsx(
        'fixed pointer-events-none z-10 transition-all duration-300',
        'text-xs font-mono px-2 py-1 rounded bg-hive-bgCard/90 backdrop-blur border',
        isJarvis ? 'text-cyan border-cyan/50 text-gradient-cyan' : 'text-hive-textMuted border-hive-border',
        'whitespace-nowrap'
      )}
      style={{
        left: screenPos.x,
        top: screenPos.y - (isJarvis ? 50 : 30),
        transform: 'translate(-50%, -100%)',
      }}
    >
      {node.name}
      <span className="ml-2 text-[10px] opacity-60">{node.role}</span>
    </div>
  );
}

function StateIndicator({ node }: { node: SpiderNode }) {
  const stateLabels: Record<string, string> = {
    idle: 'IDLE',
    active: 'ACTIVE',
    thinking: 'THINKING',
    communicating: 'COMM',
    approving: 'APPROVE',
    rejecting: 'REJECT',
    executing: 'EXEC',
  };

  const stateColors: Record<string, string> = {
    idle: 'hive-textDim',
    active: 'hive-cyan',
    thinking: 'hive-purple',
    communicating: 'hive-green',
    approving: 'hive-green',
    rejecting: 'hive-red',
    executing: 'hive-orange',
  };

  return (
    <div className={`absolute -top-2 -right-2 text-[9px] font-mono px-1.5 py-0.5 rounded-full ${stateColors[node.state]} border border-current/50`}>
      {stateLabels[node.state]}
    </div>
  );
}

export function SpiderHiveCanvas({ onNodeClick }: { onNodeClick: (node: SpiderNode) => void }) {
  const { nodes, edges, hoveredNode, selectedNode, cameraPosition, cameraTarget } = useSpiderStore();
  const { agents } = useDataStore();

  // Sync agent states to spider nodes
  useEffect(() => {
    const state = useSpiderStore.getState();
    agents.forEach(agent => {
      const node = state.nodes.find(n => n.id === agent.id);
      if (node && node.state !== agent.status) {
        state.updateNodeState(agent.id, agent.status);
      }
    });
  }, [agents]);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: cameraPosition, fov: 45, near: 0.1, far: 200 }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        shadows={false}
      >
        <color attach="background" args={['#03050a']} />
        <fog attach="fog" args={['#03050a', 30, 100]} />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.3} color="#0a1528" />
        <directionalLight position={[20, 30, 20]} intensity={0.5} color="#00e5ff" />
        <directionalLight position={[-20, -30, -20]} intensity={0.3} color="#b87dff" />
        <pointLight position={[0, 0, 0]} color="#00e5ff" intensity={0.3} distance={50} decay={2} />
        
        {/* Grid helper for depth perception */}
        <gridHelper args={[100, 20, '#00e5ff22', '#b87dff22']} position={[0, -35, 0]} />
        
        {/* Edges */}
        {edges.map((edge, idx) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;
          
          return (
            <React.Fragment key={`edge-${idx}`}>
              <EdgeLine edge={edge} sourcePos={sourceNode.position} targetPos={targetNode.position} />
              <Particles edge={edge} sourcePos={sourceNode.position} targetPos={targetNode.position} />
            </React.Fragment>
          );
        })}
        
        {/* Nodes */}
        {nodes.map((node) => {
          const isJarvis = node.id === 'jarvis';
          return (
            <React.Fragment key={node.id}>
              <NodeMesh
                node={node}
                isJarvis={isJarvis}
                onClick={() => onNodeClick(node)}
                onHover={() => useSpiderStore.getState().setHoveredNode(node.id)}
                onHoverEnd={() => useSpiderStore.getState().setHoveredNode(null)}
              />
              <NodeLabel node={node} isJarvis={isJarvis} />
              <StateIndicator node={node} />
            </React.Fragment>
          );
        })}
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass px-4 py-3 rounded-xl border-hive-border/50 text-hive-textMuted text-sm font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-hive-text font-semibold">NODES</span>
          {nodes.map(node => (
            <span key={node.id} className="flex items-center gap-1.5">
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: node.color }}
              />
              <span className={node.id === 'jarvis' ? 'text-gradient-cyan font-semibold' : ''}>
                {node.name}
              </span>
            </span>
          ))}
        </div>
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
      <div className="w-full h-full glass flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan/50 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-hive-textMuted">Initializing Hive Network...</p>
        </div>
      </div>
    );
  }

  return <SpiderHiveCanvas onNodeClick={onNodeClick} />;
}