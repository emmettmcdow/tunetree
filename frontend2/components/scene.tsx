import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

const Car = () => {
  const carRef = useRef<Mesh>(null!)

  useFrame((state) => {
    if (!carRef.current) return
    
    // Move car in a figure-8 pattern
    const t = state.clock.elapsedTime
    carRef.current.position.x = Math.sin(t * 0.5) * 4
    carRef.current.position.z = Math.sin(t * 0.25) * 8
    carRef.current.rotation.y = -Math.sin(t * 0.5) * 0.25 + Math.PI
  })

  return (
    <group position={[0, 1, 0]}>
      {/* Car body */}
      <mesh ref={carRef}>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#4287f5" flatShading />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 0.4, -1]} scale={[1.8, 0.4, 1]}>
        <boxGeometry />
        <meshStandardMaterial color="#4287f5" flatShading />
      </mesh>
      {/* Wheels */}
      <mesh position={[-1, -0.3, -1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      <mesh position={[1, -0.3, -1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      <mesh position={[-1, -0.3, 1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      <mesh position={[1, -0.3, 1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
    </group>
  )
}

const Road = () => {
  return (
    <>
      {/* Road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 40]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0066cc" />
      </mesh>

      {/* Guard rails */}
      <mesh position={[-10, 1, 0]}>
        <boxGeometry args={[0.2, 2, 40]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[10, 1, 0]}>
        <boxGeometry args={[0.2, 2, 40]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
    </>
  )
}

const Scene2: React.FC<{
  dimensions: Array<number>
  colors?: Array<string>
  image?: string
}> = ({ dimensions }) => {
  return (
    <div style={{ width: dimensions[0], height: dimensions[1] }}>
      <Canvas
        camera={{ position: [15, 8, 15], fov: 50 }}
      >
        <color attach="background" args={['#87CEEB']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
        
        {/* Scene */}
        <Car />
        <Road />
      </Canvas>
    </div>
  )
}

export default Scene2
