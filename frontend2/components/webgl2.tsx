import { extend, RootState } from '@react-three/fiber'
import { TextureLoader, Mesh, MeshPhongMaterial, Object3D, Vector3, Group, Scene, Object3DEventMap } from 'three'
import React, { useRef, useEffect, forwardRef} from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { Center, Text3D} from '@react-three/drei'
import { GLTFLoader, TextGeometry } from 'three/examples/jsm/Addons.js';
import helvetiker_regular from 'three/examples/fonts/helvetiker_regular.typeface.json'
import Scene2 from './scene'
// Debug
// import {OrbitControls} from '@react-three/drei'
// import { Perf } from 'r3f-perf'
// import { AxesHelper} from 'three';

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

const Player = forwardRef((_: unknown, ref: React.ForwardedRef<Object3D<Object3DEventMap>>) => {
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
Player.displayName = "Player";

const Cover: React.FC<{ image: string, camPos: Vector3}> = ({ image, camPos}) => {
  const objectRef = useRef<Object3D>(null);
  console.log("re-render cover");
  const texture = useLoader(TextureLoader, image);
  useEffect(() => {
    if (typeof objectRef.current != "undefined") {
      objectRef.current?.lookAt(new Vector3(...camPos));
    }
  });
  return (
    <mesh ref={objectRef} position={[0.3, -0.13, 0.25]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshPhongMaterial map={texture} />
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

function SkyBox() {
  const scene: Scene  = useThree((state: RootState) => {return state.scene});
  const texture = useLoader(TextureLoader, "/photos/night.jpg");

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
  useFrame((_state: RootState, delta: number) => {
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
  const camPos = new Vector3(0.4, 0.0, 0.8);
  return (
    <Canvas
      className="absolute top-0 left-0 z-0 rounded-2xl"
      style={{ width: dimensions[0], height: dimensions[1], position: "absolute"}}
      camera={{ position: camPos,  fov: 100 }}
      resize={{ scroll: false }}
    >
      <Vinyl image={image} camPos={camPos}/>
    </Canvas>
  );
};

const Vinyl: React.FC<{ image: string, camPos: Vector3}> = ({ image, camPos }) => {
  const vinylref = React.createRef<Object3D>();
  const camref = useThree((state: RootState) => state.camera);
  const circleSize = 1/8;
  useFrame((state: RootState,) => {
    if (typeof vinylref.current != "undefined" && typeof camref != "undefined") {
      camref.position.x = camPos.x + (circleSize * Math.cos(state.clock.elapsedTime));
      camref.position.y = camPos.y + (circleSize * Math.sin(state.clock.elapsedTime));
      camref.position.z = camPos.z;
      camref.lookAt(vinylref.current?.position || new Vector3(0,0,0));
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
      <SpinText artist="foo" track="bar" />
      <Cover image={image} camPos={camref.position}/>
    </>
  );
}

const CubeScene: React.FC<{ image: string, dimensions: Array<number>}> = ({ image, dimensions }) => {
  return (
    <Canvas
      className="absolute top-0 left-0 z-0 rounded-2xl"
      style={{ width: dimensions[0], height: dimensions[1], position: "absolute"}}
      camera={{ position: [1,1,1], fov: 100 }}
      resize={{ scroll: false }}
    >
      <Cube image={image}/>
    </Canvas>
  );
};

const Cube: React.FC<{ image: string}> = ({ image }) => {
  const cubeRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, image);

  useFrame((_state: RootState, delta: number) => {
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
        <meshPhongMaterial map={texture} />
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
      camera={{ position: [0,1.1,0.5], rotation: [radians(-5), 0, 0], fov: 150 }}
      resize={{ scroll: false }}
    >
      <Mountain colors={colors}/>
    </Canvas>
  );
};

function interpolateColor(color1: string, color2: string, ratio: number) {
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

const Mountain: React.FC<{colors: Array<string>}> = ({ colors }) => {
  // Controls how quickly the colors switch
  const scalingColor = 5;
  let currInterpolation = 0;
  // Colors
  let colorIdx = 0;
  let color1 = colors[colorIdx];
  let color2 = colors[colorIdx + 1];
  // Refs
  const mountain = useLoader(GLTFLoader, "/models/halfmountain.gltf");
  const mtnGroup = useRef<Group>(null);
  const material = new MeshPhongMaterial({color: "red"});



  useFrame((_state: RootState, delta: number) => {
    if (typeof mtnGroup.current !== "undefined" && mtnGroup.current != null){
      mtnGroup.current.rotation.x += delta;

      // Color animation
      if (currInterpolation >= 1) {
        currInterpolation = 0;
        color1 = color2
        colorIdx = (colorIdx + 1) % colors.length
        color2 = colors[colorIdx];
      }
      const [r,g,b] = interpolateColor(color1, color2, currInterpolation);
      currInterpolation += delta / scalingColor;
      material.color.setRGB(r/255, g/255, b/255);
    }
  });


  return (
    <>
      <SkyBox/>
      <pointLight position={[2, 2, 2]} intensity={20}/>
      <group scale={1} position={[0.15, 0, 0]} rotation={[0,0,radians(90)]} ref={mtnGroup}>
        <mesh position={[0,0.9,0]}
              geometry={(mountain.nodes.Cylinder as Mesh).geometry}
              rotation={[0, 0, radians(180)]}
              material={material}
              >
        </mesh>
        <mesh position={[0,-0.9,0]}
              geometry={(mountain.nodes.Cylinder001 as Mesh).geometry}
              material={material}>
        </mesh>
      </group>
    </>
  )
}

{/*
function Debug() {
  return (
    <>
      <Perf/>
      <primitive object={new AxesHelper(50)} />
      <OrbitControls />
    </>
  );
}
*/}


export const ANIMATIONS = ["cube", "vinyl", "mountain"];


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
  if (typeof image == "undefined" || image == "") {
    image = "/placeholder.png";
  }
  if (typeof colors == "undefined" || colors.length < 2) {
    colors = ["#00FF00", "#FF0000", "#0000FF"];
  }
  if (typeof scene == "undefined" || scene == "" ) {
    scene = "cube";
  }
  switch(scene) {
    case "cube":
      return <CubeScene dimensions={[width, height]} image={image}/>;
    case "vinyl":
      return <VinylScene dimensions={[width, height]} image={image}/>;
    case "mountain":
      return <MountainScene colors={colors} dimensions={[width, height]} />;
    case "dynamic":
      return <Scene2 dimensions={[width, height]} image={image} colors={colors}/>
    default:
      return null;
  }
};

export default WebGLBackground;
