import LightButton from "@/components/lightbutton";
import Talk from "@/components/talk";
import { Header } from "./login";

export default function Help() {
  // const words = (
  //   <span className="text-3xl text-center absolute top-20 left-24 -rotate-12">
  //     help!
  //   </span>
  // );
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center py-8">
      {/*<Talk words={words}/>*/}
      <div className="fg-color w-11/12 rounded-xl p-4 md:w-3/5">
        <Header left="help!" />
        <div className="mt-2">
          if you are having issues including but not limited to:
          <ul className="m-2 text-white">
            <li>* forgot password / locked out of account</li>
            <li>* someone else is using my identity</li>
            <li>* something is broken</li>
          </ul>
          <span className="mr-1"> shoot me a dm on X: </span>
          <LightButton link="https://x.com/mcd0w/" content="@mcd0w" />
        </div>
      </div>
    </div>
  );
}
