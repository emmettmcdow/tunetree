import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { shader as shader1 } from './shader'

const ShaderComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let camera: THREE.OrthographicCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let uniforms: { [uniform: string]: THREE.IUniform };
    let clock: THREE.Clock;
    let frameId: number;

    const init = (): void => {
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current?.appendChild(renderer.domElement);

      const geometry = new THREE.PlaneGeometry(2, 2);

      clock = new THREE.Clock();
      uniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
        iMouse: { value: new THREE.Vector4() }
      };

      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
          void main() {
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: shader1});

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    };

    const onMouseMove = (event: MouseEvent): void => {
      uniforms.iMouse.value.x = event.clientX;
      uniforms.iMouse.value.y = event.clientY;
    };

    const animate = (): void => {
      frameId = requestAnimationFrame(animate);
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };

    init();
    animate();
    // window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

const shader2 = 
`
          uniform vec3 iResolution;
          uniform float iTime;
          uniform vec4 iMouse;

          void mainImage( out vec4 fragColor, in vec2 fragCoord )
          {
              vec2 uv = fragCoord/iResolution.xy;
              vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
              fragColor = vec4(col,1.0);
          }

          void main() {
            mainImage(gl_FragColor, gl_FragCoord.xy);
          }
        `

export default ShaderComponent;
