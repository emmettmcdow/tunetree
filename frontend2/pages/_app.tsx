import "@/styles/globals.css";
import type { AppProps } from "next/app";

function Footer() {
  return (
    <div className="flex flex-col text-center bg-indigo-200 py-4">
        <div className="my-2" >made with 💜 in sunnyvale, ca 🌞</div>
        <div className="my-2" ><a href="/login">are you an artist? get <i>your</i> link here</a></div>
        <div className="my-2" ><a>buy me a ☕️</a></div>
        <div className="my-2" >font by <a href="https://fontenddev.com">jeti</a></div>
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-indigo-100">
      <Component {...pageProps} />
      <Footer/>
    </div>
  );
}
