import Link from "next/link";

import UIButton from "@/components/uibutton";
import { Header } from "./login";
import Image from "next/image";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";

// function DynamicPanel({
//   statement,
//   detail,
//   img,
//   n,
// }: {
//   statement: string;
//   detail: string;
//   img: string;
//   n: number;
// }) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [hide, setHide] = useState<boolean>(true);

//   const handleExpand = () => {
//     if (!hide) {
//       setHide(true);
//       return;
//     }
//     setHide(false);
//     if (videoRef.current) {
//       // Set the current time to 0 (beginning of video)
//       videoRef.current.currentTime = 0;
//       // Start playing
//       videoRef.current.play();
//     }
//   };

//   const styleWithDelay = {
//     "--delay": `${-n}s`,
//   } as React.CSSProperties;

//   return (
//     <div className="my-4 flex flex-col items-center text-xl md:text-2xl">
//       <div>
//         <span className="mr-2" onClick={handleExpand}>
//           {hide ? (
//             <FiChevronRight
//               style={styleWithDelay}
//               className="rainbow-svg inline cursor-pointer rounded-xl border-2"
//             />
//           ) : (
//             <FiChevronDown
//               style={styleWithDelay}
//               className="rainbow-svg inline cursor-pointer rounded border-2"
//             />
//           )}
//         </span>
//         <span className="inline">{statement}</span>
//       </div>
//       <div
//         className={
//           "fg-color my-2 flex flex-col items-center rounded-xl pt-0 text-center " +
//           (hide ? "hidden" : "")
//         }
//       >
//         <video
//           ref={videoRef}
//           className="w-3/5 rounded-2xl border-2"
//           autoPlay
//           muted
//           loop
//           playsInline
//         >
//           <source src={img} />
//         </video>
//         <span className="m-2 text-center">{detail}</span>
//       </div>
//     </div>
//   );
// }

function Panel({ detail, img }: { detail: string; img: string }) {
  return (
    <div
      className={
        "fg-color my-4 flex flex-col items-center justify-center rounded-xl md:flex-row"
      }
    >
      <div className="text-md m-2 w-full text-center md:w-1/5">{detail}</div>
    </div>
  );
}

export default function About() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center py-8">
      {/*<Talk words={words}/>*/}
      <div className="fg-color flex w-11/12 flex-col justify-around rounded-xl p-4 md:w-3/5">
        <Header left={"what's tunetree?"} />

        <div className="my-8 flex flex-col items-center justify-center">
          <div className="flex w-11/12 flex-col items-center justify-between md:w-4/5 md:flex-row">
            <div className="flex w-11/12 items-center justify-center md:w-2/5">
              <span className="text-md rainbow-svg inline-block rounded-xl border px-2">
                <span>tunetree.xyz/my-link</span>
                <FiChevronRight className="rainbow-svg inline" />
              </span>
            </div>

            <FiArrowRight className="m-2 rotate-90 md:rotate-0" size={35} />

            <video
              className="w-11/12 rounded-2xl md:w-2/5"
              width={500}
              height={500}
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={"/videos/link-demo.mp4"} />
            </video>
          </div>

          <div className="my-4 w-11/12 text-center text-xl md:w-4/5">
            get a link to your music you can easily share on social media
          </div>
        </div>

        <div
          className={
            "my-8 flex flex-col items-center justify-center md:flex-row"
          }
        >
          <div className="flex flex-col items-center justify-center">
            <div className="my-4 flex items-center justify-center">
              <Image
                className="w-2/5 rounded-2xl"
                alt="album art prior to ai animation"
                width={200}
                height={200}
                src="/photos/example-art.png"
              />

              <FiArrowRight className="m-2" size={35} />

              <video
                className="w-2/5 rounded-2xl"
                width={200}
                height={200}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/videos/example-animation.mp4" />
              </video>
            </div>

            <div className="my-4 w-11/12 text-center text-xl md:w-4/5">
              customize your page using an animated version of your album art
              made with ai
            </div>
          </div>
        </div>

        <div className={"my-4 flex flex-col items-center justify-center"}>
          <Image
            className="w-11/12 rounded-2xl md:w-4/5"
            alt="email to fan"
            width={1024}
            height={1024}
            src="/photos/email.png"
          />
          <div className="my-4 w-11/12 text-center text-xl md:w-4/5">
            we will send your fans an email when you release
          </div>
        </div>
      </div>

      <div className="fg-color my-2 flex w-11/12 flex-col items-center rounded-xl p-4 md:w-3/5">
        <div className="text-center text-2xl"> get started now </div>
        <div>
          <Link href="/signup" className="mx-2">
            <UIButton
              type="neutral"
              content="signup"
              handle={() => {}}
              submit={false}
            />
          </Link>
          <Link href="/login" className="mx-2">
            <UIButton
              type="neutral"
              content="login"
              handle={() => {}}
              submit={false}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
