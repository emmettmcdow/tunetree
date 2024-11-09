'use client';

import * as THREE from "three";
import {useState, useRef, useEffect} from 'react';


function sceneCube(canvas: HTMLCanvasElement, colors: Array<string>, image: string){
      const fov = 75;
      const aspect = window.innerWidth / window.innerHeight;  // the canvas default
      const near = 0.1;
      const far = 5;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.z = 2;

      const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
      const scene = new THREE.Scene();

      const boxWidth = 1;
      const boxHeight = 1;
      const boxDepth = 1;
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

      const loader = new THREE.TextureLoader();
      const texture = loader.load(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      // const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
      const material = new THREE.MeshPhongMaterial({map: texture});

      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      const color = 0xFFFFFF;
      const intensity = 3;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, 2, 4);
      scene.add(light);
      function render(time: number) {
        time *= 0.001;  // convert time to seconds
 
        cube.rotation.x = time;
        cube.rotation.y = time;
 
        renderer.render(scene, camera);
 
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
}


export default function WebGLBackground({colors, image, scene}: {colors: Array<string>, image: string, scene: string}) {
  const canvasRef = useRef(null)
  const [isClient, setIsClient] = useState(false)  

  useEffect(() => {
    setIsClient(true);
    if (canvasRef != null && canvasRef.current != null) {
      switch(scene){
        case "cube":
          sceneCube(canvasRef.current, colors, image);
          break
        default:
          console.log("NO SCENE!");
          break
      }
    }
  });

  if (typeof window !== "undefined") {
    return (
        isClient && <canvas id="glcanvas" ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="w-full h-full absolute top-0 left-0 z-0" />
    );
  }
}
