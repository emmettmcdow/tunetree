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

const AiPrompt = ({ visible, toggleVisible }: AiPromptProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {};
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <div
      className={
        "fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 " +
        (visible ? "" : "hidden")
      }
    >
      <div className="fg-color z-50 w-1/2 rounded-2xl p-5 text-center shadow-inner drop-shadow-2xl">
        <Header left="ai background" />
        <div className="p-2">
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
          <div className="m-4">
            Using AI you can generate an animated background based on your album
            art. <br />
            <br />
            Simply enter a short sentence or phrase to explain how to animate
            your art.
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex-col items-center border-t-2 border-neutral-900 p-2 text-left"
        >
          <label className="my-2 flex justify-between">
            <span>your prompt:</span>
            <Tooltip
              text="Each credit gets you one animation generation. Limit 5 while Tunetree is in beta."
              hackNoArrow={true}
            >
              <div className="flex items-center">
                <FiInfo className="m-1 inline" />
                credits left: 5{" "}
              </div>
            </Tooltip>
          </label>
          <input
            className="font-light-bg-norm w-full rounded-lg p-1 pr-10 text-black"
            type="text"
            name="Prompt"
            onChange={handleChange}
            placeholder="trippy, weird, psychedelic"
          />
          <div className="flex justify-center">
            <UIButton
              type="deny"
              content="cancel"
              handle={toggleVisible}
              submit={false}
            />
            <UIButton
              type="confirm"
              content="generate"
              handle={() => {
                console.log("Submitted");
              }}
              submit={true}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiPrompt;
