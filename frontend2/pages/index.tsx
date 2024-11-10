import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="h-screen flex-col content-center text-center">
        <Image src="/logo-white.png" alt="tunetree logo" width="1024" height="1024" className="w-36 mx-auto"/>
        <h1 className="text-7xl txt-color">tunetree</h1>
        <Link className="text-2xl my-2 txt-color" href="/about">Join the music revolution</Link>
      </div>
    </>
  );
}
