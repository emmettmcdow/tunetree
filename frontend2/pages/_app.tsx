import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import LightButton from "@/components/lightbutton";

function Footer() {
  return (
    <div className="fg-color font-lg font-ui flex flex-col items-center py-4 text-center">
      <div className="my-2 w-11/12">made with 💜 in sunnyvale, ca 🌞</div>
      <LightButton link="/about" content="are you an artist?" />
      <LightButton link="/help" content="need help?" />
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-color font-ui text-lg">
      <DefaultSeo
        title={"tunetree"}
        description={"join the music revolution"}
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://tunetree.xyz",
          site_name: "tunetree",
          images: [
            {
              url: "https://tunetree.xyz/card.png",
              width: 1024,
              height: 1024,
              alt: "tunetree logo",
            },
          ],
        }}
        twitter={{
          handle: "@mcd0w",
          site: "tunetree.xyz",
        }}
      />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
