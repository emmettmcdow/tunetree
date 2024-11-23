import { extend } from '@react-three/fiber'
import { CubeTextureLoader, TextureLoader, DirectionalLight, Mesh, MeshPhongMaterial, SphereGeometry, DirectionalLightHelper, SpotLight, SpotLightHelper, Object3D, Vector3, Box3, Group, BufferGeometry, BufferAttribute, PointLight, PerspectiveCamera, AxesHelper, Scene } from 'three'
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
  scene: string;
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

const Cover: React.FC<{ image: string, camPos: Vector3}> = ({ image, camPos}) => {
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
  const scene: Scene  = useThree((state) => {return state.scene});
  const loader = new TextureLoader();
  // The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
  const texture = loader.load(
    "/photos/night.jpg");

  // Set the scene background property to the resulting texture.
  scene.background = texture;
  scene.backgroundIntensity = 0.5;
  scene.backgroundBlurriness = 0.125;
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
      <Cover image={image} camPos={camref.position}/>
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
      className="absolute top-0 left-0 z-0 rounded-2xl"
      style={{ width: dimensions[0], height: dimensions[1], position: "absolute"}}
      resize={{ scroll: false }}
    >
      <_Mountain colors={colors}/>
    </Canvas>
  );
};

function interpolateColor(color1, color2, ratio) {
    const rgb1 = parseInt(color1.replace('#', ''), 16);
    const rgb2 = parseInt(color2.replace('#', ''), 16);
    
    const r1 = (rgb1 >> 16) & 255;
    const g1 = (rgb1 >> 8) & 255;
    const b1 = rgb1 & 255;
    
    const r2 = (rgb2 >> 16) & 255;
    const g2 = (rgb2 >> 8) & 255;
    const b2 = rgb2 & 255;
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return [r, g, b];
}

const _Mountain: React.FC<{colors: Array<string>}> = ({ colors }) => {
  // Settings
  const xOff = -5;
  const yOff = 0;
  const zOff = 0;
  const geoScale = 1 / 5;
  // Controls how quickly the colors switch
  const scalingColor = 5;
  let currInterpolation = 0;
  // Colors
  let colorIdx = 0;
  let color1 = colors[colorIdx];
  let color2 = colors[colorIdx + 1];
  // Refs
  const camref = useThree((state: any) => state.camera) as PerspectiveCamera;
  const mountain = useLoader(GLTFLoader, "/models/halfmountain.gltf");
  const material = new MeshPhongMaterial({color: "#90A959"});
  const meshes = useRef([]);
  let center = new Vector3(0,10,10);

  mountain.scene.traverse((o) => {
    if (o.isMesh) {
      o.material = material;
      meshes.current = meshes.current.concat(o);
    }
  })

  if (camref.current != "undefined") {
    camref.lookAt(new Vector3(center.x + xOff, center.y + yOff, center.z + zOff));
    camref.position.set(center.x + 5, center.y+5, center.z);
    camref.fov = 130;
    camref.updateProjectionMatrix();
  }

  useFrame((state: any, delta: number) => {
    if (meshes.current.constructor.name == "Array"){
      // Rotation
      let rev = 1;
      meshes.current.forEach((mesh: Object3D) => {
        mesh.rotation.y += delta * rev * geoScale;
        // hack
        rev *= -1;
      })

      // Color animation
      if (currInterpolation >= 1) {
        currInterpolation = 0;
        color1 = color2
        colorIdx = (colorIdx + 1) % colors.length
        color2 = colors[colorIdx];
      }
      let [r,g,b] = interpolateColor(color1, color2, currInterpolation);
      currInterpolation += delta / scalingColor;
      material.color.setRGB(r/255, g/255, b/255);
    }
  });


  return (
    <>
      <SkyBox/>
      <pointLight position={[center.x+5, center.y+15, center.z]} intensity={200}/>
      {/*<primitive object={new AxesHelper(50)} />*/}
      <primitive
        object={mountain.scene}
        position={[0,0,0]}>

      </primitive>
    </>
  )
}


// Main component
const WebGLBackground: React.FC<SceneProps> = ({
  colors,
  image,
  scene,
  width,
  height,
}) => {
  if (typeof window === "undefined") {
    return <></>;
  }
  // Colors
  if (typeof colors == "undefined" || colors.length < 2) {
    colors = ["#00FF00", "#FF0000", "#0000FF"];
  }
  switch(scene) {
    case "cube":
      return <CubeScene dimensions={[width, height]} image={image}/>;
    case "vinyl":
      return <VinylScene dimensions={[width, height]} image={image}/>;
    case "mountain":
      return <MountainScene colors={colors} dimensions={[width, height]} />;
    default:
      return null;
  }
};

export default WebGLBackground;
