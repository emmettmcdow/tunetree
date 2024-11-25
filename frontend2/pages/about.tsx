import Image from "next/image"
import { FiChevronDown } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
import Link from 'next/link';

import Talk from "@/components/talk";
import { useState } from "react";
import UIButton from "@/components/uibutton";

function Panel({statement, img, alt}: {statement: string, img: string, alt: string}) {

  const [hide, setHide] = useState<boolean>(true);
  return (
    <div className="text-xl md:text-2xl">
      <span className="mr-2" onClick={() => {setHide(!hide)}}>
        {hide ? <FiChevronRight className="inline rainbow-svg border-2 rounded"/> : <FiChevronDown className="inline rainbow-svg border-2 rounded"/>}
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
      <div className="mt-8 mx-auto">
        <Panel statement="tunetree grows artists." img="/placeholder-square.png" alt="changeme"/>
        <Panel statement="tunetree helps artists update fans." img="/placeholder-square.png" alt="changeme"/>
        <Panel statement="tunetree is place for self expression." img="/placeholder-square.png" alt="changeme"/>
      </div>
      <div className="mx-auto my-4">
        <Link href="/login"><UIButton type="neutral" content="Login" handle={() => {}} submit={false}/></Link>
        <Link href="/signup"><UIButton type="neutral" content="Signup" handle={() => {}} submit={false}/></Link>
      </div>
    </div>
  );
}
