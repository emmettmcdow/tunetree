import { TextureLoader, Mesh } from 'three'
import React, { useRef, useEffect} from 'react'
// @ts-ignore: 2305
import { Canvas, useFrame, useThree } from '@react-three/fiber'

// Helper function

const radians = (degrees: number) => (degrees * Math.PI) / 180;


// Types
interface SceneProps {
  colors: string[];
  image: string;
  width: number;
  height: number;
}

interface CameraControlsProps {
  moveSpeed?: number;
  rotateSpeed?: number;
}

// Camera controls component with keyboard input
const CameraControls: React.FC<CameraControlsProps> = ({
  moveSpeed = 0.25,
  rotateSpeed = radians(15),
}) => {
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "w":
          camera.position.y += moveSpeed;
          break;
        case "s":
          camera.position.y -= moveSpeed;
          break;
        case "a":
          camera.position.x -= moveSpeed;
          break;
        case "d":
          camera.position.x += moveSpeed;
          break;
        case "ArrowUp":
          camera.rotateX(rotateSpeed);
          break;
        case "ArrowDown":
          camera.rotateX(-rotateSpeed);
          break;
        case "ArrowLeft":
          camera.rotateY(rotateSpeed);
          break;
        case "ArrowRight":
          camera.rotateY(-rotateSpeed);
          break;
        case " ":
          camera.position.set(0, 0, 2);
          camera.rotation.set(0, 0, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, moveSpeed, rotateSpeed]);

  return null;
};

// Reusable components
const Desk: React.FC = () => {
  return (
    <group position={[0, -0.25, 0.25]}>
      <mesh>
        <boxGeometry args={[1, 0.05, 0.5]} />
        <meshPhongMaterial color="#D97217" />
      </mesh>
      {/* Legs */}
      {[
        [0.47, -0.125, 0.22],
        [0.47, -0.125, -0.22],
        [-0.47, -0.125, -0.22],
        [-0.47, -0.125, 0.22],
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          <boxGeometry args={[0.05, 0.25, 0.05]} />
          <meshPhongMaterial color="#D97217" />
        </mesh>
      ))}
    </group>
  );
};

const Player: React.FC = () => {
  return (
    <group position={[0, -0.2, 0.25]}>
      <mesh>
        <boxGeometry args={[0.25, 0.05, 0.25]} />
        <meshPhongMaterial color="#383838" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.06]} />
        <meshPhongMaterial color="#000000" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.005, 0.005, 0.08]} />
        <meshPhongMaterial color="#b6b6b6" />
      </mesh>
    </group>
  );
};

const Cover: React.FC<{ image: string }> = ({ image }) => {
  return (
    <mesh position={[-0.3, -0.13, 0.25]} rotation={[-radians(15), 0, 0]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshPhongMaterial map={new TextureLoader().load(image)} />
    </mesh>
  );
};

const Wall: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  return (
    <mesh position={position}>
      <planeGeometry args={[1, 1]} />
      <meshPhongMaterial color="#44aa88" />
    </mesh>
  );
};

const Lamp: React.FC = () => {
  return (
    <mesh position={[0.3, -0.13, 0.25]}>
      <boxGeometry args={[0.25, 0.05, 0.25]} />
      <meshPhongMaterial color="#FFFFFF" />
    </mesh>
  );
};

// Scene components
const VinylScene: React.FC<{ image: string }> = ({ image }) => {
  return (
    <>
      <CameraControls />
      <directionalLight position={[-1, 2, 4]} intensity={3} />

      {/* Walls */}
      <Wall position={[0.7, 0, 0]} />
      <Wall position={[-0.7, 0, 0]} />
      <Wall position={[0, -0.7, 0]} />
      <Wall position={[0, 0.95, 0]} />

      {/* Floor */}
      <mesh position={[0, -0.5, 0.5]} rotation={[-radians(90), 0, 0]}>
        <planeGeometry args={[10, 1]} />
        <meshPhongMaterial color="#DCC86B" />
      </mesh>

      <Desk />
      <Player />
      <Cover image={image} />
      <Lamp />
    </>
  );
};

const CubeScene: React.FC<{ image: string }> = ({ image }) => {
  const cubeRef = useRef<Mesh>(null);

  useFrame((state: any, delta: number) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += delta;
      cubeRef.current.rotation.y += delta;
    }
  });

  return (
    <>
      <directionalLight position={[-1, 2, 4]} intensity={3} />
      <mesh ref={cubeRef}>
        <boxGeometry />
        <meshPhongMaterial map={new TextureLoader().load(image)} />
      </mesh>
    </>
  );
};

// Main component
const WebGLBackground: React.FC<SceneProps & { scene: string }> = ({
  colors,
  image,
  scene,
  width,
  height,
}) => {
  if (typeof window === "undefined") return <></>;

  return (
    <Canvas
      className="absolute top-0 left-0 z-0"
      style={{ width, height }}
      camera={{ position: [0, 0, 2], fov: 75 }}
    >
      {scene === "cube" ? (
        <CubeScene image={image} />
      ) : scene === "vinyl" ? (
        <VinylScene image={image} />
      ) : null}
    </Canvas>
  );
};

export default WebGLBackground;
