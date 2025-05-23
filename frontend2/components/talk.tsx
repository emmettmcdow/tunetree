import Image from "next/image"

export default function Talk({words}: {words: React.ReactNode}) {
  return(
      <div className="mx-auto w-fit relative">
        {words}
        <Image alt="tunetree DJ logo saying something" src="/404-logo-white.png" width={400} height={400}/>
      </div>
  );
}
