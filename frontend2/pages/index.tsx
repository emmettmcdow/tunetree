import Image from "next/image";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export default function Home() {
  return (
    <>
      <div className="font-h1 h-screen flex-col content-center text-center">
        <Image
          src="/logo-white.png"
          alt="tunetree logo"
          width="1024"
          height="1024"
          className="mx-auto w-36"
        />
        <h1 className="txt-color text-7xl">tunetree</h1>
        <Link className="my-2 text-2xl" href="/about">
          <span className="rainbow-svg font-ui">join the music revolution</span>
          <FiChevronRight className="rainbow-svg inline" />
        </Link>
      </div>
    </>
  );
}
