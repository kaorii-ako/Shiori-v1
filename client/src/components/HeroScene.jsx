import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Icosahedron, TorusKnot, MeshDistortMaterial } from '@react-three/drei'

// Brand-tinted floating shapes that gently react to the pointer.
// Kept deliberately light (few meshes, capped dpr) so it never janks on a Chromebook.

function FloatingShape({ position, color, scale = 1, speed = 1, distort = 0.28, geometry = 'ico' }) {
  const mat = (
    <MeshDistortMaterial
      color={color} emissive={color} emissiveIntensity={0.22}
      roughness={0.08} metalness={0.65} distort={distort} speed={1.6}
      transparent opacity={0.92} />
  )
  return (
    <Float speed={speed * 1.4} rotationIntensity={1.1} floatIntensity={1.6}>
      {geometry === 'knot' ? (
        <TorusKnot args={[0.62, 0.2, 160, 28]} position={position} scale={scale}>{mat}</TorusKnot>
      ) : (
        <Icosahedron args={[1, 2]} position={position} scale={scale}>{mat}</Icosahedron>
      )}
    </Float>
  )
}

function Rig({ children }) {
  const group = useRef()
  useFrame((state) => {
    if (!group.current) return
    // ease the whole scene toward the pointer for a parallax feel
    const tx = state.pointer.x * 0.4
    const ty = state.pointer.y * 0.3
    group.current.rotation.y += (tx - group.current.rotation.y) * 0.04
    group.current.rotation.x += (-ty - group.current.rotation.x) * 0.04
  })
  return <group ref={group}>{children}</group>
}

export default function HeroScene() {
  const shapes = useMemo(() => ([
    { position: [-3.7, 0.5, -2], color: '#6f8bff', scale: 0.9, speed: 1, geometry: 'ico', distort: 0.24 },
    { position: [3.8, -0.3, -2.4], color: '#c98bff', scale: 0.72, speed: 1.3, geometry: 'knot', distort: 0.22 },
    { position: [2.9, 1.9, -3], color: '#5ee0a0', scale: 0.4, speed: 1.6, geometry: 'ico', distort: 0.3 },
    { position: [-2.9, -1.7, -2.6], color: '#ff8fb6', scale: 0.36, speed: 1.8, geometry: 'ico', distort: 0.3 },
    { position: [3.3, -1.8, -2.2], color: '#ffd28a', scale: 0.32, speed: 1.5, geometry: 'ico', distort: 0.32 },
  ]), [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[6, 6, 6]} intensity={1.2} color="#9db8ff" />
      <pointLight position={[-6, -4, 2]} intensity={1.1} color="#d9a9ff" />
      <pointLight position={[0, 4, -4]} intensity={0.8} color="#5ee0a0" />
      <Suspense fallback={null}>
        <Rig>
          {shapes.map((s, i) => <FloatingShape key={i} {...s} />)}
        </Rig>
      </Suspense>
    </Canvas>
  )
}
