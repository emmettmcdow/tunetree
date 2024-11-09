'use client';

import ShaderCanvas, { shader } from '../utils/shader';
import {useState, useRef, useEffect} from 'react';

export default function WebGLBackground() {
  const canvasRef = useRef(null)
  const [isClient, setIsClient] = useState(false)

  let shaderCanvas: ShaderCanvas | null = null;

  
  const fpsLimit = 30;
  let previousDelta = 0;
  function animate(time: number): void {
    // We know shaderCanvas isn't null
    requestAnimationFrame(animate);

    var delta = time - previousDelta;

    if (fpsLimit && delta < 1000 / fpsLimit) {
        return;
    }
    shaderCanvas!.render(time);
    previousDelta = time;
  }

  useEffect(() => {
    setIsClient(true);
    if (canvasRef != null && canvasRef.current != null) {
      if (shaderCanvas == null) {
        shaderCanvas = new ShaderCanvas(canvasRef.current, shader);
      }
      if (shaderCanvas) {
        animate(0);
      }
    }
  });
  if (typeof window !== "undefined") {
    return (
        isClient && <canvas id="glcanvas" ref={canvasRef} width={window.innerWidth / 1.5} height={window.innerHeight / 1.5} className="w-full h-full absolute top-0 left-0 z-0" />
    );
  }
}
