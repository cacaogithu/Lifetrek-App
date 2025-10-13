import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const helixPoints = 40;
  const radius = 1;
  const height = 4;

  return (
    <group ref={groupRef}>
      {[...Array(helixPoints)].map((_, i) => {
        const angle = (i / helixPoints) * Math.PI * 4;
        const y = (i / helixPoints) * height - height / 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={i}>
            <mesh position={[x, y, z]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[-x, y, -z]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.3} />
            </mesh>
            {i % 4 === 0 && (
              <mesh position={[0, y, 0]} rotation={[0, 0, angle]}>
                <cylinderGeometry args={[0.03, 0.03, radius * 2, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export const DNA3D = () => {
  return (
    <div className="w-full h-[350px] rounded-lg overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[3, 2, 4]} />
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={0.8} />
        <pointLight position={[-10, 0, -10]} intensity={0.4} color="#3b82f6" />
        <DNAHelix />
      </Canvas>
    </div>
  );
};
