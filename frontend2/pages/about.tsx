import { FiChevronDown } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
import Link from 'next/link';

import Talk from "@/components/talk";
import { useRef, useState } from "react";
import UIButton from "@/components/uibutton";

function Panel({statement, detail, img, n}: {statement: string, detail: string, img: string, n: number}) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hide, setHide] = useState<boolean>(true);

  const handleExpand = () => {
    if (!hide) {
      setHide(true);
      return;
    }
    setHide(false);
    if (videoRef.current) {
      // Set the current time to 0 (beginning of video)
      videoRef.current.currentTime = 0;
      // Start playing
      videoRef.current.play();
    }
  };

  const styleWithDelay = {
    "--delay":  `${-n}s`
  } as React.CSSProperties;

  return (
    <div className="text-xl md:text-2xl flex flex-col items-center my-4">
      <div>
        <span className="mr-2" onClick={handleExpand}>
          {hide ? <FiChevronRight style={styleWithDelay} className="inline rainbow-svg border-2 rounded cursor-pointer"/> : <FiChevronDown style={styleWithDelay} className="inline rainbow-svg border-2 rounded cursor-pointer"/>}
        </span>
        <span className="inline">{statement}</span>
      </div>
      <div className={"my-2 fg-color rounded-xl pt-0 text-center w-3/5 " + (hide ? "hidden" : "")}>
        <video ref={videoRef} className="border-2 rounded-2xl "  autoPlay muted loop playsInline>
          <source src={img}/>    
        </video>
        <span className="text-center m-2 inline-block">{detail}</span>
      </div>
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
    <div className="min-h-dvh flex flex-col justify-start items-center w-full py-8">
      <Talk words={words}/>
      <div className="mt-8 mx-auto">
        <Panel statement="tunetree grows artists." detail="Get a link to your music you can easily share on social media." img="/videos/link.mp4" n={3}/>
        <Panel statement="tunetree helps artists update fans." detail="We will send your fans an email when you release." img="/videos/email.mp4" n={2}/>
        <Panel statement="tunetree is place for self expression." detail="Pick from a variety of 3D animations which integrate your album art uniquely." img="/videos/art.mp4" n={1}/>
      </div>
      <div className="mx-auto my-4 fg-color rounded-xl">
        <div className="text-2xl text-center mt-4"> get started now </div>
        <Link href="/login"><UIButton type="neutral" content="Login" handle={() => {}} submit={false}/></Link>
        <Link href="/signup"><UIButton type="neutral" content="Signup" handle={() => {}} submit={false}/></Link>
      </div>
    </div>
  );
}
