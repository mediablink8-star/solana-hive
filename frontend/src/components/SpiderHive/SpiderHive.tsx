'use client';

import React, { useRef, useEffect, useMemo, useState, Suspense, createContext, useContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { INITIAL_SPIDER_NODES, INITIAL_SPIDER_EDGES } from '@/store';
import type { SpiderNode, SpiderEdge } from '@/types';
import { useSpiderStore, useDataStore } from '@/store';
import { clsx } from 'clsx';

// Context to pass camera from inside Canvas to overlay components outside
const CameraContext = createContext<THREE.Camera | null>(null);

function CameraProvider({ children }: { children: React.ReactNode }) {
  const { camera } = useThree();
  return (
    <CameraContext.Provider value={camera}>
      {children}
    </CameraContext.Provider>
  );
}

function useCamera() {
  const camera = useContext(CameraContext);
  if (!camera) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return camera;
}

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

function OrbitingParticles({ position, color, count, radius }: { 
  position: [number, number, number]; 
  color: THREE.Color; 
  count: number; 
  radius: number; 
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const alphas = new Float32Array(count);
    const angles = new Float32Array(count);
    const speeds = new Float32Array(count);
    const axisX = new Float32Array(count);
    const axisY = new Float32Array(count);
    const axisZ = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.8 + Math.random() * 0.4);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      sizes[i] = 0.08 + Math.random() * 0.15;
      alphas[i] = 0.3 + Math.random() * 0.5;
      speeds[i] = 0.05 + Math.random() * 0.15;
      
      axisX[i] = Math.random() - 0.5;
      axisY[i] = Math.random() - 0.5;
      axisZ[i] = Math.random() - 0.5;
      const axisLen = Math.sqrt(axisX[i] ** 2 + axisY[i] ** 2 + axisZ[i] ** 2);
      axisX[i] /= axisLen;
      axisY[i] /= axisLen;
      axisZ[i] /= axisLen;
      
      const c = color.clone();
      c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    g.setAttribute('angle', new THREE.BufferAttribute(angles, 1));
    g.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    g.setAttribute('axisX', new THREE.BufferAttribute(axisX, 1));
    g.setAttribute('axisY', new THREE.BufferAttribute(axisY, 1));
    g.setAttribute('axisZ', new THREE.BufferAttribute(axisZ, 1));
    
    return g;
  }, [count, radius, color]);
  
  const material = useMemo(() => 
    new THREE.PointsMaterial({
      size: 0.2,
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
    const angles = geometry.getAttribute('angle') as THREE.BufferAttribute;
    const speeds = geometry.getAttribute('speed') as THREE.BufferAttribute;
    const axisX = geometry.getAttribute('axisX') as THREE.BufferAttribute;
    const axisY = geometry.getAttribute('axisY') as THREE.BufferAttribute;
    const axisZ = geometry.getAttribute('axisZ') as THREE.BufferAttribute;
    
    for (let i = 0; i < count; i++) {
      const angle = angles.getX(i) + speeds.getX(i) * delta * 60;
      angles.setX(i, angle);
      
      const ax = axisX.getX(i);
      const ay = axisY.getX(i);
      const az = axisZ.getX(i);
      
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dot = ax * x + ay * y + az * z;
      
      const rx = x * cos + (ay * z - az * y) * sin + ax * dot * (1 - cos);
      const ry = y * cos + (az * x - ax * z) * sin + ay * dot * (1 - cos);
      const rz = z * cos + (ax * y - ay * x) * sin + az * dot * (1 - cos);
      
      positions.setXYZ(i, rx, ry, rz);
    }
    
    positions.needsUpdate = true;
  });
  
  return (
    <group position={position}>
      <points ref={particlesRef} geometry={geometry} material={material} />
    </group>
  );
}

function NodeMesh({ node, isJarvis, onClick, onHover, onHoverEnd }: {
  node: SpiderNode;
  isJarvis: boolean;
  onClick: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { nodes, hoveredNode } = useSpiderStore();
  
  const radius = isJarvis ? JARVIS_RADIUS : NODE_RADIUS;
  const segments = isJarvis ? 32 : 16;
  const pulseIntensity = node.pulseIntensity || 0;
  const isHovered = hoveredNode === node.id;
  const isSelected = false;

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

    const floatOffset = Math.sin(time * 1.5 + node.position[0]) * 0.15;
    meshRef.current.position.y = node.position[1] + floatOffset;
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
            geometry={new THREE.IcosahedronGeometry(radius * 2.5, 1)}
            material={new THREE.MeshBasicMaterial({
              color: baseColor,
              transparent: true,
              opacity: 0.05,
              side: THREE.BackSide,
            })}
            position={node.position as [number, number, number]}
          />
          <mesh
            geometry={new THREE.IcosahedronGeometry(radius * 1.8, 1)}
            material={new THREE.MeshBasicMaterial({
              color: baseColor,
              transparent: true,
              opacity: 0.08,
              side: THREE.BackSide,
            })}
            position={node.position as [number, number, number]}
          />
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
          
          <group position={node.position as [number, number, number]}>
            <mesh
              geometry={new THREE.TorusGeometry(radius * 1.4, 0.04, 16, 64)}
              material={new THREE.MeshBasicMaterial({
                color: baseColor,
                transparent: true,
                opacity: 0.6,
              })}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
          
          <group position={node.position as [number, number, number]}>
            <mesh
              geometry={new THREE.TorusGeometry(radius * 1.6, 0.03, 16, 64)}
              material={new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xb87dff),
                transparent: true,
                opacity: 0.5,
              })}
              rotation={[0, Math.PI / 2, 0]}
            />
          </group>
          
          <group position={node.position as [number, number, number]}>
            <mesh
              geometry={new THREE.TorusGeometry(radius * 1.8, 0.02, 16, 64)}
              material={new THREE.MeshBasicMaterial({
                color: new THREE.Color(0x00ff88),
                transparent: true,
                opacity: 0.4,
              })}
              rotation={[Math.PI / 4, Math.PI / 4, 0]}
            />
          </group>
          
          <OrbitingParticles 
            position={node.position as [number, number, number]} 
            color={baseColor}
            count={30}
            radius={radius * 2.2}
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
  const lineRef = useRef<any>(null);
  
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

  const lineObject = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);
  lineObject.computeLineDistances();
  
  useFrame((_, delta) => {
    if (!lineRef.current) return;
    
    const time = Date.now() * 0.001;
    (material as any).dashOffset = (time * 0.5) % 1;
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      0.2 + edge.intensity * 0.6,
      delta * 3
    );
  });

  return (
    <primitive
      ref={lineRef}
      object={lineObject}
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
    if (!particlesRef.current) return;
    
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
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
      
      const color = sourceColor.clone().lerp(targetColor, p);
      colorAttr.setXYZ(i, color.r, color.g, color.b);
      
      let alpha = 0;
      if (p < 0.1) alpha = p * 10;
      else if (p > 0.9) alpha = (1 - p) * 10;
      else alpha = 1;
      
      if (activeParticle) alpha = 1;
      
      alphas.setX(i, alpha);
      sizes.setX(i, activeParticle ? sizes.getX(i) * 2 : sizes.getX(i));
    }
    
    positions.needsUpdate = true;
    colorAttr.needsUpdate = true;
    alphas.needsUpdate = true;
    sizes.needsUpdate = true;
    progressAttr.needsUpdate = true;
  });

  return <points ref={particlesRef} geometry={geometry} material={material} />;
}

function NodeMeshLabel({ node, isJarvis }: { node: SpiderNode; isJarvis: boolean }) {
  const { camera } = useThree();
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0, visible: false });
  const vector = new THREE.Vector3(...node.position);
  
  useFrame(() => {
    if (typeof window === 'undefined') return;
    const pos = vector.clone().project(camera);
    setScreenPos({
      x: (pos.x * 0.5 + 0.5) * window.innerWidth,
      y: (-pos.y * 0.5 + 0.5) * window.innerHeight,
      visible: pos.z < 1,
    });
  });

  if (!screenPos.visible || typeof window === 'undefined') return null;

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

function SpiderHiveCanvasInner({ onNodeClick }: { onNodeClick: (node: SpiderNode) => void }) {
  const { nodes, edges, hoveredNode, selectedNode, cameraPosition, cameraTarget, updateEdgeIntensity, addEdgeParticle } = useSpiderStore();
  const { agents, wsMessages } = useDataStore();

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

  useEffect(() => {
    const state = useSpiderStore.getState();
    
    const messageFlow: Record<string, Array<{from: string, to: string, color: string}>> = {
      token_discovered: [
        { from: 'jarvis', to: 'token-scout', color: '#00e5ff' },
        { from: 'token-scout', to: 'rug-detector', color: '#00ff88' },
      ],
      analysis_started: [
        { from: 'jarvis', to: 'rug-detector', color: '#ff3366' },
        { from: 'jarvis', to: 'technical-analyst', color: '#b87dff' },
        { from: 'jarvis', to: 'social-intelligence', color: '#ff8800' },
      ],
      analysis_complete: [
        { from: 'rug-detector', to: 'strategy-analyst', color: '#ff3366' },
        { from: 'technical-analyst', to: 'strategy-analyst', color: '#b87dff' },
        { from: 'social-intelligence', to: 'strategy-analyst', color: '#ff8800' },
      ],
      decision_made: [
        { from: 'strategy-analyst', to: 'risk-manager', color: '#00e5ff' },
      ],
      trade_executed: [
        { from: 'risk-manager', to: 'execution-trader', color: '#00ff88' },
        { from: 'execution-trader', to: 'portfolio-manager', color: '#00ff88' },
      ],
      risk_alert: [
        { from: 'risk-manager', to: 'jarvis', color: '#ff3366' },
      ],
    };

    wsMessages.forEach(message => {
      const flow = messageFlow[message.type];
      if (flow) {
        flow.forEach(({ from, to, color }) => {
          const edgeExists = state.edges.some(e => 
            (e.source === from && e.target === to) || (e.source === to && e.target === from)
          );
          if (edgeExists) {
            state.addEdgeParticle(from, to, {
              id: crypto.randomUUID(),
              progress: 0,
              speed: 0.8,
              color,
              size: 0.4,
            });
            
            state.updateEdgeIntensity(from, to, 1.0);
            setTimeout(() => {
              state.updateEdgeIntensity(from, to, 0.3);
            }, 2000);
          }
        });

        const nodeStateMap: Record<string, { nodeId: string; state: SpiderNode['state'] }[]> = {
          token_discovered: [
            { nodeId: 'token-scout', state: 'active' },
            { nodeId: 'jarvis', state: 'communicating' },
          ],
          analysis_started: [
            { nodeId: 'rug-detector', state: 'thinking' },
            { nodeId: 'technical-analyst', state: 'thinking' },
            { nodeId: 'social-intelligence', state: 'thinking' },
            { nodeId: 'jarvis', state: 'communicating' },
          ],
          analysis_complete: [
            { nodeId: 'rug-detector', state: 'communicating' },
            { nodeId: 'technical-analyst', state: 'communicating' },
            { nodeId: 'social-intelligence', state: 'communicating' },
            { nodeId: 'strategy-analyst', state: 'thinking' },
          ],
          decision_made: [
            { nodeId: 'strategy-analyst', state: 'communicating' },
            { nodeId: 'risk-manager', state: 'thinking' },
          ],
          trade_executed: [
            { nodeId: 'risk-manager', state: 'approving' },
            { nodeId: 'execution-trader', state: 'executing' },
            { nodeId: 'portfolio-manager', state: 'active' },
          ],
          risk_alert: [
            { nodeId: 'risk-manager', state: 'rejecting' },
            { nodeId: 'jarvis', state: 'active' },
          ],
        };

        const nodeUpdates = nodeStateMap[message.type];
        if (nodeUpdates) {
          nodeUpdates.forEach(({ nodeId, state: nodeState }) => {
            state.updateNodeState(nodeId, nodeState, 1.0);
            setTimeout(() => {
              state.updateNodeState(nodeId, 'idle', 0);
            }, 3000);
          });
        }
      }
    });
  }, [wsMessages]);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: cameraPosition, fov: 50, near: 0.1, far: 200 }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
        shadows={false}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <color attach="background" args={['#03050a']} />
        <fog attach="fog" args={['#03050a', 40, 150]} />
        
        <ambientLight intensity={0.6} color="#0a1528" />
        <directionalLight position={[30, 40, 30]} intensity={1.0} color="#00e5ff" />
        <directionalLight position={[-30, -40, -30]} intensity={0.6} color="#b87dff" />
        <pointLight position={[0, 0, 0]} color="#00e5ff" intensity={1.0} distance={80} decay={2} />
        <pointLight position={[0, 20, 0]} color="#b87dff" intensity={0.5} distance={60} decay={2} />
        
        <gridHelper args={[100, 20, '#00e5ff15', '#b87dff15']} position={[0, -35, 0]} />
        
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={150}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
        
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
            </React.Fragment>
          );
        })}
      <OverlayManager nodes={nodes} onNodeClick={onNodeClick} />

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

const NodeLabelsOverlay = React.memo(function NodeLabelsOverlay({ nodes, onNodeClick, positions }: { nodes: SpiderNode[]; onNodeClick: (node: SpiderNode) => void; positions: Record<string, { x: number; y: number; visible: boolean }> }) {
  return (
    <>
      {nodes.map(node => {
        const pos = positions[node.id];
        if (!pos || !pos.visible || typeof window === 'undefined') return null;
        const isJarvis = node.id === 'jarvis';
        return (
          <div
            key={node.id}
            className={clsx(
              'fixed pointer-events-none z-10 transition-all duration-300',
              'text-xs font-mono px-2 py-1 rounded bg-hive-bgCard/90 backdrop-blur border',
              isJarvis ? 'text-cyan border-cyan/50 text-gradient-cyan' : 'text-hive-textMuted border-hive-border',
              'whitespace-nowrap'
            )}
            style={{
              left: pos.x,
              top: pos.y - (isJarvis ? 50 : 30),
              transform: 'translate(-50%, -100%)',
            }}
            onClick={() => onNodeClick(node)}
          >
            {node.name}
            <span className="ml-2 text-[10px] opacity-60">{node.role}</span>
          </div>
        );
      })}
    </>
  );
});

const StateIndicatorsOverlay = React.memo(function StateIndicatorsOverlay({ nodes, positions }: { nodes: SpiderNode[]; positions: Record<string, { x: number; y: number; visible: boolean }> }) {
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
    <>
      {nodes.map(node => {
        const pos = positions[node.id];
        if (!pos || !pos.visible || typeof window === 'undefined') return null;
        return (
          <div
            key={node.id}
            className={`fixed pointer-events-none z-10 transition-all duration-300 text-[9px] font-mono px-1.5 py-0.5 rounded-full ${stateColors[node.state]} border border-current/50`}
            style={{
              left: pos.x,
              top: pos.y - 35,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {stateLabels[node.state]}
          </div>
        );
      })}
    </>
  );
});

function OverlayManager({ nodes, onNodeClick }: { nodes: SpiderNode[]; onNodeClick: (node: SpiderNode) => void }) {
  const camera = useCamera();
  const positionsRef = React.useRef<Record<string, { x: number; y: number; visible: boolean }>>({});
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const updatePositions = () => {
      if (typeof window === 'undefined') return;
      const newPositions: Record<string, { x: number; y: number; visible: boolean }> = {};
      nodes.forEach(node => {
        const vector = new THREE.Vector3(...node.position);
        const pos = vector.clone().project(camera);
        newPositions[node.id] = {
          x: (pos.x * 0.5 + 0.5) * window.innerWidth,
          y: (-pos.y * 0.5 + 0.5) * window.innerHeight,
          visible: pos.z < 1,
        };
      });
      positionsRef.current = newPositions;
      setTick(t => t + 1);
    };
    
    updatePositions();
    const interval = setInterval(updatePositions, 1000 / 30); // 30fps
    return () => clearInterval(interval);
  }, [nodes, camera]);

  const positions = positionsRef.current;

  return (
    <>
      <NodeLabelsOverlay nodes={nodes} onNodeClick={onNodeClick} positions={positions} />
      <StateIndicatorsOverlay nodes={nodes} positions={positions} />
    </>
  );
}

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
    <>
      {nodes.map(node => {
        const pos = positions[node.id];
        if (!pos || !pos.visible || typeof window === 'undefined') return null;
        return (
          <div
            key={node.id}
            className={`fixed pointer-events-none z-10 transition-all duration-300 text-[9px] font-mono px-1.5 py-0.5 rounded-full ${stateColors[node.state]} border border-current/50`}
            style={{
              left: pos.x,
              top: pos.y - 35,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {stateLabels[node.state]}
          </div>
        );
      })}
    </>
  );
}

function SpiderHiveCanvas({ onNodeClick }: { onNodeClick: (node: SpiderNode) => void }) {
  const { nodes, edges, hoveredNode, selectedNode, cameraPosition, cameraTarget } = useSpiderStore();
  const { agents, wsMessages } = useDataStore();

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

  useEffect(() => {
    const state = useSpiderStore.getState();
    
    const messageFlow: Record<string, Array<{from: string, to: string, color: string}>> = {
      token_discovered: [
        { from: 'jarvis', to: 'token-scout', color: '#00e5ff' },
        { from: 'token-scout', to: 'rug-detector', color: '#00ff88' },
      ],
      analysis_started: [
        { from: 'jarvis', to: 'rug-detector', color: '#ff3366' },
        { from: 'jarvis', to: 'technical-analyst', color: '#b87dff' },
        { from: 'jarvis', to: 'social-intelligence', color: '#ff8800' },
      ],
      analysis_complete: [
        { from: 'rug-detector', to: 'strategy-analyst', color: '#ff3366' },
        { from: 'technical-analyst', to: 'strategy-analyst', color: '#b87dff' },
        { from: 'social-intelligence', to: 'strategy-analyst', color: '#ff8800' },
      ],
      decision_made: [
        { from: 'strategy-analyst', to: 'risk-manager', color: '#00e5ff' },
      ],
      trade_executed: [
        { from: 'risk-manager', to: 'execution-trader', color: '#00ff88' },
        { from: 'execution-trader', to: 'portfolio-manager', color: '#00ff88' },
      ],
      risk_alert: [
        { from: 'risk-manager', to: 'jarvis', color: '#ff3366' },
      ],
    };

    wsMessages.forEach(message => {
      const flow = messageFlow[message.type];
      if (flow) {
        flow.forEach(({ from, to, color }) => {
          const edgeExists = state.edges.some(e => 
            (e.source === from && e.target === to) || (e.source === to && e.target === from)
          );
          if (edgeExists) {
            state.addEdgeParticle(from, to, {
              id: crypto.randomUUID(),
              progress: 0,
              speed: 0.8,
              color,
              size: 0.4,
            });
            
            state.updateEdgeIntensity(from, to, 1.0);
            setTimeout(() => {
              state.updateEdgeIntensity(from, to, 0.3);
            }, 2000);
          }
        });

        const nodeStateMap: Record<string, { nodeId: string; state: SpiderNode['state'] }[]> = {
          token_discovered: [
            { nodeId: 'token-scout', state: 'active' },
            { nodeId: 'jarvis', state: 'communicating' },
          ],
          analysis_started: [
            { nodeId: 'rug-detector', state: 'thinking' },
            { nodeId: 'technical-analyst', state: 'thinking' },
            { nodeId: 'social-intelligence', state: 'thinking' },
            { nodeId: 'jarvis', state: 'communicating' },
          ],
          analysis_complete: [
            { nodeId: 'rug-detector', state: 'communicating' },
            { nodeId: 'technical-analyst', state: 'communicating' },
            { nodeId: 'social-intelligence', state: 'communicating' },
            { nodeId: 'strategy-analyst', state: 'thinking' },
          ],
          decision_made: [
            { nodeId: 'strategy-analyst', state: 'communicating' },
            { nodeId: 'risk-manager', state: 'thinking' },
          ],
          trade_executed: [
            { nodeId: 'risk-manager', state: 'approving' },
            { nodeId: 'execution-trader', state: 'executing' },
            { nodeId: 'portfolio-manager', state: 'active' },
          ],
          risk_alert: [
            { nodeId: 'risk-manager', state: 'rejecting' },
            { nodeId: 'jarvis', state: 'active' },
          ],
        };

        const nodeUpdates = nodeStateMap[message.type];
        if (nodeUpdates) {
          nodeUpdates.forEach(({ nodeId, state: nodeState }) => {
            state.updateNodeState(nodeId, nodeState, 1.0);
            setTimeout(() => {
              state.updateNodeState(nodeId, 'idle', 0);
            }, 3000);
          });
        }
      }
    });
  }, [wsMessages]);

  return (
    <div className="relative w-full h-full">
      <CameraProvider>
        <Canvas
          camera={{ position: cameraPosition, fov: 50, near: 0.1, far: 200 }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
          shadows={false}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.2;
          }}
        >
          <color attach="background" args={['#03050a']} />
          <fog attach="fog" args={['#03050a', 40, 150]} />
          
          <ambientLight intensity={0.6} color="#0a1528" />
          <directionalLight position={[30, 40, 30]} intensity={1.0} color="#00e5ff" />
          <directionalLight position={[-30, -40, -30]} intensity={0.6} color="#b87dff" />
          <pointLight position={[0, 0, 0]} color="#00e5ff" intensity={1.0} distance={80} decay={2} />
          <pointLight position={[0, 20, 0]} color="#b87dff" intensity={0.5} distance={60} decay={2} />
          
          <gridHelper args={[100, 20, '#00e5ff15', '#b87dff15']} position={[0, -35, 0]} />
          
          <OrbitControls 
            enableDamping={true}
            dampingFactor={0.05}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={20}
            maxDistance={150}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
          
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
              </React.Fragment>
            );
          })}
        </Canvas>
      </CameraProvider>
      <OverlayManager nodes={nodes} onNodeClick={onNodeClick} />

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
  );
}

function SpiderHiveLoader() {
  return (
    <div className="w-full h-full glass flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-cyan/50 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-hive-textMuted">Initializing Hive Network...</p>
        <p className="text-hive-textDim text-xs mt-2">Loading JARVIS core and 8 specialist agents</p>
      </div>
    </div>
  );
}

export function SpiderHive({ onNodeClick }: { onNodeClick: (node: SpiderNode) => void }) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <SpiderHiveLoader />;
  }

  if (error) {
    return (
      <div className="w-full h-full glass flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-hive-text text-lg mb-2">Failed to initialize Hive Network</p>
          <p className="text-hive-textDim text-sm mb-4">{error.message}</p>
          <button 
            onClick={() => { setError(null); setMounted(false); setTimeout(() => setMounted(true), 100); }}
            className="px-4 py-2 bg-cyan/20 text-cyan rounded-lg border border-cyan/50 hover:bg-cyan/30 transition-colors font-mono text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<SpiderHiveLoader />}>
      <SpiderHiveCanvas onNodeClick={onNodeClick} />
    </Suspense>
  );
}