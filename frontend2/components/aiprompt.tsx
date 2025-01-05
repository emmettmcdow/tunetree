import { useState } from "react";
import UIButton from "./uibutton";
import Image from "next/image";
import { FiArrowRight, FiInfo } from "react-icons/fi";
import { Header } from "@/pages/login";
import Tooltip from "./tooltip";
import { AnimationJob, Track, User } from "@/model";
import { getAuthorizationHeader } from "@/utils/utils";

interface AiPromptProps {
  visible: boolean;
  toggleVisible: () => void;
  track: Track;
  user: User;
  addJob: (job: string) => void;
}

const AiPrompt = ({
  visible,
  toggleVisible,
  track,
  user,
  addJob,
}: AiPromptProps) => {
  const [, setMessage] = useState("");
  const [formData, setFormData] = useState(
    new AnimationJob({
      user_id: user.id,
      status: "requested",
      art_link: track.image,
      animation_link: "",
      prompt: "",
    }),
  );
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Convert form data to string
    console.log(formData);
    const jsonData = JSON.stringify(formData);
    console.log(jsonData);
    let responseBody = "";
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}animation/new/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getAuthorizationHeader(),
          },
          body: jsonData,
          credentials: "include",
        },
      );

      if (response.ok) {
        const responseJSON = await response.json();
        addJob(responseJSON["uuid"]);
        toggleVisible();
      } else {
        responseBody = await response.text();
        switch (response.status) {
          case 401:
            // Un-authorized
            window.location.href = "/login";
            break;
          case 400:
            // Bad Request
            setMessage(responseBody);
            break;
          case 405:
            // Method not allowed
            throw new Error(responseBody);
          case 500:
            // Internal error
            throw new Error(responseBody);
          default:
            throw new Error(
              "Unhandled response(" + response.status + "): " + responseBody,
            );
        }
      }
    } catch (error) {
      // Handle network or other errors
      setMessage("Something has gone critically wrong: " + error);
    }
  };
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(
      new AnimationJob({
        user_id: user.id,
        status: "requested",
        art_link: track.image,
        animation_link: "",
        prompt: event.target.value,
      }),
    );
  };

  return (
    <div
      className={
        "fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 " +
        (visible ? "" : "hidden")
      }
    >
      <div className="fg-color z-50 w-11/12 rounded-2xl p-5 text-center shadow-inner drop-shadow-2xl md:w-3/5">
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
            <div className="m-2">
              <UIButton
                type="deny"
                content="cancel"
                handle={toggleVisible}
                submit={false}
              />
            </div>
            <div className="m-2">
              <UIButton
                type="confirm"
                content="generate"
                handle={() => {
                  console.log("Submitted");
                }}
                submit={true}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiPrompt;
