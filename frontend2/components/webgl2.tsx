import { extend } from '@react-three/fiber'
import { CubeTextureLoader, TextureLoader, DirectionalLight, Mesh, MeshPhongMaterial, SphereGeometry, DirectionalLightHelper, SpotLight, SpotLightHelper, Object3D, Vector3, Box3, Group, BufferGeometry, BufferAttribute, PointLight } from 'three'
import React, { useRef, useEffect, forwardRef, useMemo, useCallback } from 'react'
// @ts-ignore: 2305
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { useHelper, OrbitControls, Center, Text3D} from '@react-three/drei'
import { FontLoader, GLTFLoader, TextGeometry } from 'three/examples/jsm/Addons.js';
import helvetiker_regular from 'three/examples/fonts/helvetiker_regular.typeface.json'

extend({ TextGeometry })

// Helper function
const radians = (degrees: number) => (degrees * Math.PI) / 180;


// Types
interface SceneProps {
  colors: string[];
  image: string;
  width: number;
  height: number;
}


/**************************************************************************************** Desk */

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

const Player = forwardRef((_: unknown, ref: Ref<HTMLDivElement>) => {
  return (
    <group position={[0, -0.2, 0.25]} ref={ref}>
      <mesh>
        <boxGeometry args={[0.25, 0.05, 0.25]} />
        <meshPhongMaterial color="#484848" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.06]} />
        <meshPhongMaterial color="#000000" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.061]} />
        <meshPhongMaterial color="#FDF7E7" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.005, 0.005, 0.08]} />
        <meshPhongMaterial color="#b6b6b6" />
      </mesh>
    </group>
  );
});

const Cover: React.FC<{ image: string }> = ({ image }) => {
  const objectRef = useRef<Object3D>(null);
  useEffect(() => {
    if (typeof objectRef.current != "undefined") {
      objectRef.current?.lookAt(new Vector3(...camPos));
    }
  });
  return (
    <mesh ref={objectRef} position={[0.3, -0.13, 0.25]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshPhongMaterial map={new TextureLoader().load(image)} />
    </mesh>
  );
};

const Wall: React.FC<{ position: [number, number, number], size: [number, number], rot: [number, number, number]}> = ({
  position,
  size,
  rot
}) => {
  return (
    <mesh position={position} rotation={rot}>
      <planeGeometry args={size} />
      <meshPhongMaterial color="#44aa88" />
    </mesh>
  );
};

const Lamp: React.FC = () => {
  const target = new Object3D();
  target.position.set(0, -0.2, 0.25);

  const luxo = useLoader(GLTFLoader, "/models/luxo.gltf");
  luxo.materials.Luxo.color.r = .71;
  luxo.materials.Luxo.color.b = .71;
  luxo.materials.Luxo.color.g = .71;
  const scaleFactor = 1 / 7;
  const bulbPos = [0.22, -0.04, 0.26];
  
  return (<>
    <primitive
      object={luxo.scene}
      scale={[scaleFactor, scaleFactor, scaleFactor]}
      position={[0.3, -0.225, 0.25]}
      color={"#FFFFFF"}
      material={new MeshPhongMaterial({color: "#FFFFFF"})}/>
  </>
  );
};

function SkyBox() {
  const { scene } = useThree();
  const loader = new CubeTextureLoader();
  // The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
  const texture = loader.load([
    "/photos/night.jpg",
    "/photos/night.jpg",
    "/photos/night.jpg",
    "/photos/night.jpg",
    "/photos/night.jpg",
    "/photos/night.jpg",
  ]);

  // Set the scene background property to the resulting texture.
  scene.background = texture;
  return null;
}

function SpinText({artist, track}: {artist: string, track: string}) {
  const fontref = useRef<Group>();
  const text = artist + "\n\n" + track
  useEffect(() => {
  }, []);
  useFrame((state: any, delta: number) => {
    if (typeof fontref.current != "undefined") {
      fontref.current.rotation.y += delta;
    }
  });
  return (
      <group ref={fontref} position={[0,-0.17,0.25]}>
        <Center>
          <Text3D
            font={helvetiker_regular}
            size={0.01}
            height={0.002}
            curveSegments={12}
            rotation-x={radians(-90)}
          >
            {text}
            <meshPhongMaterial color="purple" />
          </Text3D>
        </Center>
      </group>
  );
}

// Scene components
const VinylScene: React.FC<{ image: string, dimensions: Array<number>}> = ({ image, dimensions }) => {
  const camPos = [0.4, 0.0, 0.8];
  return (
    <Canvas
      className="absolute top-0 left-0 z-0"
      style={{ width: dimensions[0], height: dimensions[1], position: "absolute"}}
      camera={{ position: camPos,  fov: 100 }}
      resize={{ scroll: false }}
    >
      <_VinylScene image={image} camPos={camPos}/>
    </Canvas>
  );
};

const _VinylScene: React.FC<{ image: string, camPos: Array<number>}> = ({ image, camPos }) => {
  const vinylref = React.createRef<Object3D>();
  const camref = useThree((state: any) => state.camera);
  const circleSize = 1/8;
  useFrame((state: any, delta: number) => {
    if (typeof vinylref.current != "undefined" && typeof camref != "undefined") {
      camref.position.x = camPos[0] + (circleSize * Math.cos(state.clock.elapsedTime));
      camref.position.y = camPos[1] + (circleSize * Math.sin(state.clock.elapsedTime));
      camref.position.z = camPos[2];
      camref.lookAt(vinylref.current?.position);
    }
  });
  return (
    <>
      <SkyBox/>
      <directionalLight position={[1, 2, 4]} intensity={2} />

      {/* Walls */}
      <Wall position={[0.7, 0, 0]}  rot={[0,0,0]} size={[1,1]}/>
      <Wall position={[-1.2, 0, 1]} rot={[0,radians(90),0]} size={[3,3]}/>
      <Wall position={[-0.7, 0, 0]} rot={[0,0,0]} size={[1,1]}/>
      <Wall position={[0, -0.7, 0]} rot={[0,0,0]} size={[1,1]}/>
      <Wall position={[0, 0.95, 0]} rot={[0,0,0]} size={[3,1]}/>

      {/* Floor */}
      <mesh position={[0, -0.5, 5]} rotation={[-radians(90), 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshPhongMaterial color="#DCC86B" />
      </mesh>

      <Desk />
      <Player ref={vinylref}/>
      <SpinText/>
      <Cover image={image} />
    </>
  );
}

const CubeScene: React.FC<{ image: string, dimensions: Array<number>}> = ({ image, dimensions }) => {
  return (
    <Canvas
      className="absolute top-0 left-0 z-0"
      style={{ width: dimensions[0], height: dimensions[1], position: "absolute"}}
      camera={{ position: [1,1,1], fov: 100 }}
      resize={{ scroll: false }}
    >
      <_CubeScene image={image}/>
    </Canvas>
  );
};

const _CubeScene: React.FC<{ image: string}> = ({ image }) => {
  const cubeRef = useRef<Mesh>(null);

  useFrame((state: any, delta: number) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += delta;
      cubeRef.current.rotation.y += delta;
    }
  });

  return (
    <>
      <SkyBox/>
      <directionalLight position={[-1, 2, 4]} intensity={3} />
      <mesh ref={cubeRef}>
        <boxGeometry />
        <meshPhongMaterial map={new TextureLoader().load(image)} />
      </mesh>
    </>
  );
}

/**************************************************************************************** Mountains*/

const MountainScene: React.FC<{colors: Array<string>, dimensions: Array<number>}> = ({ colors, dimensions }) => {  
  return (
    <Canvas
      className="absolute top-0 left-0 z-0"
      style={{ width: dimensions[0], height: dimensions[1], position: "absolute"}}
      camera={{ position: [1,1,1], fov: 100 }}
      resize={{ scroll: false }}
    >
      <_Mountain colors={colors}/>
    </Canvas>
  );
};

const _Mountain: React.FC<{colors: Array<string>}> = ({ colors }) => {
  const target = new Object3D();
  target.position.set(0, -0.2, 0.25);

  const mountain = useLoader(GLTFLoader, "/models/halfmountain.gltf");
  const material = new MeshPhongMaterial({color: "#90A959"});
  const meshes = useRef([]);
  mountain.scene.traverse((o) => {
    if (o.isMesh) {
      o.material = material;
      meshes.current = meshes.current.concat(o);
    }
  })
  const scaleFactor = 1 / 5;

  useFrame((state: any, delta: number) => {
    if (meshes.current.constructor.name == "Array"){
      let rev = 1;
      meshes.current.forEach((mesh: Object3D) => {
        mesh.rotation.y += delta * rev * scaleFactor;
        // hack
        rev *= -1;
      })
    }
  });

  return (
    <>
      <OrbitControls/>
      <pointLight position={[20,20,20]} intensity={100}/>
      <primitive
        object={mountain.scene}
        scale={[scaleFactor, scaleFactor, scaleFactor]}
        position={[0,0,0]}
        color={"#90A959"}>

        <pointLight position={[20,20,20]} intensity={100}/>
      </primitive>
    </>
  )
}


// Main component
const WebGLBackground: React.FC<SceneProps & { scene: string }> = ({
  colors,
  image,
  scene,
  width,
  height,
}) => {
  if (typeof window === "undefined") {
    return <></>;
  }
  switch(scene) {
    case "cube":
      return <CubeScene dimensions={[width, height]} image={image}/>;
    case "vinyl":
      return <VinylScene dimensions={[width, height]} image={image}/>;
    case "mountain":
      return <MountainScene dimensions={[width, height]} />;
    default:
      return null;
  }
};

export default WebGLBackground;
