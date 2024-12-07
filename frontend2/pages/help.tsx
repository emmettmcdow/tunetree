import LightButton from "@/components/lightbutton";
import Talk from "@/components/talk";

export default function Help() {
  const words = (
    <span className="text-3xl text-center absolute top-20 left-24 -rotate-12">    
      help!
    </span>
  );
  return (  
    <div className="min-h-dvh flex flex-col justify-start items-center w-full py-8">
      <Talk words={words}/>
      <div className="fg-color rounded-xl p-4">
        if you are having issues including but not limited to:
        <ul className="text-white">
          <li>* forgot password / locked out of account</li>
          <li>* someone else is using my identify</li>
          <li>* something is broken</li>
        </ul>
        <span className="mr-1"> shoot me a dm on X: </span>
        <LightButton link="https://x.com/mcd0w/" content="@mcd0w"/>
      </div>
    </div>
  );
}
