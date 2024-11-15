'use client';

import * as THREE from "three";
import {useRef, useEffect} from 'react';


function radians(degrees: number) {
  return degrees * Math.PI / 180;
}

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

function makeDesk(): THREE.Mesh{
  const deskGeo = new THREE.BoxGeometry(1, 0.05, 0.5);
  const deskColor = new THREE.MeshPhongMaterial({color: 0xD97217});
  const desk = new THREE.Mesh(deskGeo, deskColor);

  const legGeo = new THREE.BoxGeometry(0.05,0.25,0.05);
  const leg1 = new THREE.Mesh(legGeo, deskColor);
  leg1.position.set(0.47,-0.125,0.22);
  desk.add(leg1);
  const leg2 = new THREE.Mesh(legGeo, deskColor);
  leg2.position.set(0.47,-0.125,-0.22);
  desk.add(leg2);
  const leg3 = new THREE.Mesh(legGeo, deskColor);
  leg3.position.set(-0.47,-0.125,-0.22);
  desk.add(leg3);
  const leg4 = new THREE.Mesh(legGeo, deskColor);
  leg4.position.set(-0.47,-0.125,0.22);
  desk.add(leg4);
  return desk
}


function sceneVinyl(canvas: HTMLCanvasElement, colors: Array<string>, image: string){
      const fov = 75;
      const aspect = window.innerWidth / window.innerHeight;  // the canvas default
      const near = 0.1;
      const far = 5;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.z = 2;

      const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
      const scene = new THREE.Scene();


      const backWallGeo = new THREE.PlaneGeometry(1, 1);
      const wallColor = new THREE.MeshPhongMaterial({color: 0x44aa88});
      const backWall = new THREE.Mesh(backWallGeo, wallColor);
      scene.add(backWall);

      const floorGeo = new THREE.PlaneGeometry(1, 1);
      const floorColor = new THREE.MeshPhongMaterial({color: 0xDCC86B});
      const floor = new THREE.Mesh(floorGeo, floorColor);
      floor.rotateX(radians(-90));
      floor.position.set(0,-0.5,0.5);
      scene.add(floor);

      const desk = makeDesk();
      desk.position.set(0,-0.25,0.25);
      scene.add(desk);

      const color = 0xFFFFFF;
      const intensity = 3;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, 2, 4);
      scene.add(light);

      document.addEventListener("keydown", onDocumentKeyDown, false);
      function onDocumentKeyDown(event: KeyboardEvent) {
          var xSpeed = .25;
          var ySpeed = .25;
          var rotSpeed = radians(15);
        
          var keyCode = event.key;
          if (keyCode == "w") {
              camera.position.y += ySpeed;
          } else if (keyCode == "s") {
              camera.position.y -= ySpeed;
          } else if (keyCode == "a") {
              camera.position.x -= xSpeed;
          } else if (keyCode == "d") {
              camera.position.x += xSpeed;
          } else if (keyCode == "ArrowUp") {
              camera.rotateX(rotSpeed);
          } else if (keyCode == "ArrowDown") {
              camera.rotateX(-rotSpeed);
          } else if (keyCode == "ArrowLeft") {
              camera.rotateY(rotSpeed);
          } else if (keyCode == "ArrowRight") {
              camera.rotateY(-rotSpeed);
          } else if (keyCode == " ") {
              camera.position.set(0, 0, 2);
              camera.rotation.set(0,0,0)
          }
      };
  
      function render(time: number) {
        time *= 0.001;  // convert time to seconds 
        renderer.render(scene, camera);

        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
}

export default function WebGLBackground({colors, image, scene, width, height}: {colors: Array<string>, image: string, scene: string, width: number, height: number}) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (canvasRef != null && canvasRef.current != null) {
      switch(scene){
        case "cube":
          sceneCube(canvasRef.current, colors, image);
          break
        case "vinyl":
          sceneVinyl(canvasRef.current, colors, image);
          break
        default:
          console.log("NO SCENE!");
          break
      }
    }
  });

  if (typeof window !== "undefined") {
    return (
        <canvas id="glcanvas" ref={canvasRef} width={width} height={height} className="absolute top-0 left-0 z-0" />
    );
  }
}
