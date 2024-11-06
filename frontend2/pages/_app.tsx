import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { DefaultSeo } from 'next-seo';

function Footer() {
  return (
    <div className="flex flex-col text-center bg-indigo-200 py-4">
        <div className="my-2" >made with 💜 in sunnyvale, ca 🌞</div>
        <div className="my-2" ><Link href="/login">are you an artist? get <i>your</i> link here</Link></div>
        <div className="my-2" >font by <Link href="https://fontenddev.com">jeti</Link></div>
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-indigo-100">
        <DefaultSeo
          title={"tunetree"}
          description={"join the music revolution"}
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: 'https://tunetree.xyz',
            site_name: 'tunetree',
          }}
        />
      <Component {...pageProps} />
      <Footer/>
    </div>
  );
}
