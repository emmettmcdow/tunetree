import WebGLBackground from "@/components/webgl2";
import {useEffect, useState} from "react";

export default function Test() {
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  const colors = [] as Array<string>;
  const image = "/placeholder-square.png";
  const scene = "vinyl";
  return (
    <>
      {client && <WebGLBackground colors={colors} image={image} scene={scene} width={window.innerWidth} height={window.innerHeight}/>}
    </>
  );
}
