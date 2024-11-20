import WebGLBackground from "@/components/webgl2";
import {useEffect, useState} from "react";

export default function Test() {
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  const colors = ['#4a6741', '#6a8c5f', '#8fb280', '#b3d9a3'] as Array<string>;
  const image = "/placeholder-square.png";
  const scene = "mountain";
  return (
    <>
      {client && <WebGLBackground colors={colors} image={image} scene={scene} width={window.innerWidth} height={window.innerHeight}/>}
    </>
  );
}
