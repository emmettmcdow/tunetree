import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { DefaultSeo } from 'next-seo';
import LightButton from "@/components/lightbutton";

function Footer() {
  return (
    <div className="flex flex-col text-center fg-color py-4">
        <div className="my-2" >made with 💜 in sunnyvale, ca 🌞</div>
        <LightButton link="/about" content="are you an artist?"/>
        <LightButton link="/help" content="need help?"/>
        <LightButton link="https://fontenddev.com" content="font by jeti"/>
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-color">
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
