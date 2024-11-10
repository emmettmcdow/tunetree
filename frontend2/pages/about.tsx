import Image from "next/image"
import { FiChevronDown } from "react-icons/fi";
import { FiChevronUp } from "react-icons/fi";

import Talk from "@/components/talk";
import { useState } from "react";

function Panel({statement, img, alt}: {statement: string, img: string, alt: string}) {

  const [hide, setHide] = useState<boolean>(true);
  return (
    <div className="text-xl md:text-2xl">
      <span className="mr-2" onClick={() => {setHide(!hide)}}>
        {hide ? <FiChevronDown className="inline"/> : <FiChevronUp className="inline"/>}
      </span>
      <span className="inline">{statement}</span>
      {hide || <Image src={img} alt={alt} width={400} height={400} className="w-full"/>}
    </div>
  );
}

export default function About() {
  const words = (
    <span className="text-3xl text-center absolute top-20 left-24 -rotate-12">    
      what is tunetree?
    </span>
  );
  return (
    <div className="min-h-dvh flex flex-col justify-evenly items-center w-full py-8">
      <Talk words={words}/>
      <div className="w-11/12 md:w-3/5 mt-8">
        <Panel statement="tunetree grows artists." img="/placeholder-square.png" alt="changeme"/>
        <Panel statement="tunetree helps artists update fans." img="/placeholder-square.png" alt="changeme"/>
        <Panel statement="tunetree is place for self expression." img="/placeholder-square.png" alt="changeme"/>
      </div>
    </div>
  );
}
