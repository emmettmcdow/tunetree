import WebGLBackground from "@/components/webgl2";
import {useEffect, useState} from "react";

export default function Test() {
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  const colors = ["#00FF00", "#FF0000", "#0000FF"];
  const image = "/placeholder-square.png";
  const scene = "vinyl";
  return (
    <>
      {client && <WebGLBackground colors={colors} image={image} scene={scene} width={window.innerWidth} height={window.innerHeight}/>}
    </>
  );
}
