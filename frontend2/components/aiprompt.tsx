import { Dispatch, SetStateAction } from "react";
import UIButton from "./uibutton";
import Image from "next/image";
import { FiArrowRight, FiInfo } from "react-icons/fi";
import { Header } from "@/pages/login";
import Tooltip from "./tooltip";


interface AiPromptProps {
  visible: boolean;
  toggleVisible: Dispatch<SetStateAction<boolean>>;
}

const AiPrompt = ({visible, toggleVisible}: AiPromptProps) => {
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {}
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <div className={"z-50 fixed w-screen h-screen top-0 left-0 flex justify-center items-center bg-black/50 " + (visible ? "" : "hidden")}>
      <div className="fg-color rounded-2xl p-5 text-center z-50 drop-shadow-2xl shadow-inner w-1/4">
        <Header left="AI Background Generation"/>
        <div className="p-2">
          <div className="flex items-center justify-center">
            <Image className="rounded-2xl" alt="album art prior to ai animation" width={200} height={200} src="/photos/example-art.png"/>
            <FiArrowRight className="m-2"size={35}/>
            <video  className="rounded-2xl"  width={200} height={200} autoPlay muted loop playsInline>
              <source src="/videos/example-animation.mp4"/>    
            </video>
          </div>
          <div className="m-2">
            Using AI you can generate a an animated background based on your album art. Simply enter a short sentence or phrase to explain how you want your image animated and it will generate it for you.
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-col items-center p-2 border-t-2 border-neutral-900  text-left">
          <label className="flex justify-between">
            <span>Your Prompt:</span>
            <Tooltip text="Each credit gets you one animation generation. Limit 5 while Tunetree is in beta." hackNoArrow={true}>
              <div><FiInfo className="inline"/> Credits Left: 5 </div>
            </Tooltip>
          </label>
          <input className="w-full rounded-lg p-1 pr-10 text-black font-light-bg-norm" type="text" name="Prompt"  onChange={handleChange} placeholder="trippy, weird, psychedelic" />
          <div className="flex justify-center">
            <UIButton type="deny" content="Cancel" handle={toggleVisible} submit={false}/>
            <UIButton type="confirm" content="Generate" handle={() => {console.log("Submitted")}} submit={true}/>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiPrompt;
