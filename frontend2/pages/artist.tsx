import { useState, Dispatch, SetStateAction, useEffect, useRef } from "react";
import Image from "next/image";
import { FiArrowRight, FiInfo, FiX } from "react-icons/fi";

import {
  getAuthenticatedUser,
  getAuthorizationHeader,
  iconForService,
} from "../utils/utils";
import { spotifyGetArt } from "../utils/spotify";
import { getTrackInfo } from "./[track]";
import { Header, Message } from "./login";
import UIButton from "@/components/uibutton";
import Display from "@/components/display";
import { ANIMATIONS } from "@/components/webgl2";
import ScrollPrompt from "@/components/scrollprompt";
import { AnimationJob, Track, User } from "@/model";
import Tooltip from "@/components/tooltip";

function ServiceSelectorBar({
  selected,
  setSelected,
}: {
  selected: Selected;
  setSelected: React.Dispatch<React.SetStateAction<Selected>>;
}) {
  const buttons = [];
  for (const [provider, state] of Object.entries(selected)) {
    if (!state) {
      const alt = provider + "-icon";
      buttons.push(
        <button
          className="bounce-button font-ui mx-2 cursor-pointer text-xl"
          key={provider}
          onClick={() => {
            const newSelected: Selected = {
              ...selected,
              [provider]: true,
            };
            setSelected(newSelected);
          }}
        >
          <Image
            className="bounce-text w-8"
            alt={alt}
            src={iconForService(provider, false)}
            height="1024"
            width="1024"
          />
        </button>,
      );
    }
  }
  return (
    <div className="flex">
      <div className="flex w-1/4 items-center justify-start">
        <p className="font-ui text-xl">add link:</p>
      </div>
      <div className="flex w-3/4 justify-evenly">{buttons}</div>
    </div>
  );
}

function ServiceURLs({
  formData,
  setFormData,
  selected,
  setSelected,
}: {
  formData: Track;
  setFormData: React.Dispatch<React.SetStateAction<Track>>;
  selected: Selected;
  setSelected: React.Dispatch<React.SetStateAction<Selected>>;
}) {
  const serviceURLs = [];
  const handleChange = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    if (name == "message") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else if (name == "spotify") {
      const plainURL = value.split("?")[0];
      const albumID = plainURL.substring(plainURL.lastIndexOf("/") + 1);
      const [albumURL, albumName] = await spotifyGetArt(albumID);
      setFormData((prevState) => ({
        ...prevState,
        image: albumURL,
        name: albumName,
        links: {
          ...prevState["links"],
          [name]: value,
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        links: {
          ...prevState["links"],
          [name]: value,
        },
      }));
    }
  };
  for (const [provider, state] of Object.entries(selected)) {
    if (state) {
      const typedProv = provider as
        | "apple"
        | "amazon"
        | "spotify"
        | "tidal"
        | "bandcamp";
      serviceURLs.push(
        <div className="mt-2 flex" key={provider}>
          <input
            className="font-light-bg-norm w-full rounded-lg p-1 pr-10 text-black shadow-inner"
            type="text"
            name={provider}
            value={formData.links[typedProv]}
            onChange={handleChange}
            placeholder={provider + " url"}
          />
          <span
            className="flex cursor-pointer items-center justify-around"
            onClick={() => {
              const newSelected: Selected = {
                ...selected,
                [provider]: false,
              };
              setSelected(newSelected);
              setFormData({
                ...formData,
                links: {
                  ...formData.links,
                  [provider]: "",
                },
              });
            }}
          >
            <FiX className="absolute mr-10 text-black" size={25} />
          </span>
        </div>,
      );
    }
  }
  return <>{serviceURLs}</>;
}

type Selected = {
  apple: boolean;
  spotify: boolean;
  youtube: boolean;
  tidal: boolean;
  amazon: boolean;
  bandcamp: boolean;
};

const DISPLAY = ["center-card", "minimal"];
function nextDisplay(display: string) {
  const out = DISPLAY[(DISPLAY.indexOf(display) + 1) % DISPLAY.length];
  return out;
}

function lastDisplay(display: string) {
  return DISPLAY[(DISPLAY.indexOf(display) + 1) % DISPLAY.length];
}

function Editor({
  changeMode,
  setCurrTrack,
  formData,
  user,
  setFormData,
}: {
  changeMode: Dispatch<SetStateAction<Mode>>;
  setCurrTrack: Dispatch<SetStateAction<Track>>;
  formData: Track;
  user: User;
  setFormData: Dispatch<SetStateAction<Track>>;
}) {
  const initialState: Selected = {
    apple: formData.links.apple != "",
    spotify: formData.links.spotify != "",
    youtube: formData.links.youtube != "",
    tidal: formData.links.tidal != "",
    amazon: formData.links.amazon != "",
    bandcamp: formData.links.bandcamp != "",
  };
  const [selected, setSelected] = useState(initialState);
  const [aiVisible, setAiVisible] = useState(false);
  const [message, setMessage] = useState("");
  const submitRef = useRef<HTMLDivElement>(null);
  const [animJobs, setJobs] = useState<Array<string>>([]);

  const [aiJob, setAiJob] = useState(
    new AnimationJob({
      user_id: user.id,
      status: "requested",
      art_link: formData.image,
      animation_link: "",
      prompt: "",
    }),
  );
  const addJob = (job: string) => {
    setJobs([...animJobs, job]);
  };

  const toggleVisible = () => {
    setAiVisible(!aiVisible);
  };

  const animations = [...ANIMATIONS, ...animJobs];
  function nextAnim(animation: string) {
    const out =
      animations[(animations.indexOf(animation) + 1) % animations.length];
    return out;
  }

  function lastAnim(animation: string) {
    return animations[
      (animations.length + animations.indexOf(animation) - 1) %
        animations.length
    ];
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    setMessage: Dispatch<SetStateAction<string>>,
  ) => {
    event.preventDefault();

    // Convert form data to JSON
    const jsonData = JSON.stringify(formData);
    let responseBody = "";
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}track/${user.link}/`,
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
        setCurrTrack(formData);
        changeMode(Mode.Standby);
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

  const aiSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Convert form data to string
    const jsonData = JSON.stringify(aiJob);
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
        const uuid = responseJSON["uuid"];
        setMessage("");
        addJob(uuid);
        toggleVisible();
        setFormData((prev) => {
          return {
            ...prev,
            animation: uuid,
          };
        });
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
            setAiVisible(false);
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
      setAiVisible(false);
    }
  };

  return (
    <>
      <div className="z-40 flex w-11/12 flex-col md:w-3/5">
        <Message content={message} />

        <div className="my-2 flex items-center justify-between">
          <UIButton
            type="left"
            submit={false}
            handle={() => {
              setFormData({
                ...formData,
                animation: lastAnim(formData.animation),
              });
            }}
          />
          <span className="font-ui text-xl">change animation</span>
          <UIButton
            type="right"
            submit={false}
            handle={() => {
              setFormData({
                ...formData,
                animation: nextAnim(formData.animation),
              });
            }}
          />
        </div>

        <UIButton
          type="neutral"
          content="make ai background"
          submit={false}
          handle={toggleVisible}
        />

        <div className="mt-2 flex items-center justify-between">
          <UIButton
            type="left"
            submit={false}
            handle={() => {
              setFormData({
                ...formData,
                display: lastDisplay(formData.display),
              });
            }}
          />
          <span className="font-ui text-xl">change display</span>
          <UIButton
            type="right"
            submit={false}
            handle={() => {
              setFormData({
                ...formData,
                display: nextDisplay(formData.display),
              });
            }}
          />
        </div>

        <form
          onSubmit={(e) => handleSubmit(e, setMessage)}
          className="flex-col items-center justify-evenly"
        >
          <div className="my-8">
            <ServiceSelectorBar selected={selected} setSelected={setSelected} />
            <ServiceURLs
              formData={formData}
              setFormData={setFormData}
              selected={selected}
              setSelected={setSelected}
            />
          </div>

          <div className="my-8">
            <label className="font-ui block text-xl">message to fans:</label>
            <textarea
              className="font-light-bg-norm w-full rounded-lg p-1 text-black"
              value={formData["message"]}
              onChange={(e) => {
                const newTrack: Track = {
                  ...formData,
                  message: e.target.value,
                };
                setFormData(newTrack);
              }}
              name="message"
              placeholder="you're gonna love this one..."
            />
          </div>

          <div ref={submitRef} className="flex justify-center">
            <div className="mx-2">
              <UIButton
                type="deny"
                content="cancel"
                handle={() => {
                  changeMode(Mode.Standby);
                }}
                submit={false}
              />
            </div>
            <div className="mx-2">
              <UIButton
                type="confirm"
                content="submit"
                handle={() => {}}
                submit={true}
              />
            </div>
          </div>
        </form>
      </div>
      <div
        className={
          "fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 " +
          (aiVisible ? "" : "hidden")
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
            <div className="m-2 md:m-4">
              Using AI you can generate an animated background based on your
              album art. <br />
              <br />
              Simply enter a short sentence or phrase to explain how to animate
              your art.
            </div>
          </div>
          <form
            onSubmit={aiSubmit}
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
                  credits: 5{" "}
                </div>
              </Tooltip>
            </label>
            <input
              className="font-light-bg-norm w-full rounded-lg p-1 pr-10 text-black"
              type="text"
              name="Prompt"
              onChange={(e) => {
                setAiJob((prev) => {
                  return {
                    ...prev,
                    prompt: e.target.value,
                  };
                });
              }}
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
      <ScrollPrompt target={submitRef} />
    </>
  );
}
enum Mode {
  Standby = 1,
  Edit,
  New,
}

function EditPanel({
  mode,
  changeMode,
  currTrack,
  setCurrTrack,
  formData,
  setFormData,
  user,
}: {
  mode: Mode;
  changeMode: Dispatch<SetStateAction<Mode>>;
  currTrack: Track;
  setCurrTrack: Dispatch<SetStateAction<Track>>;
  formData: Track;
  setFormData: Dispatch<SetStateAction<Track>>;
  user: User;
}) {
  switch (mode) {
    case Mode.Standby:
      return (
        <div className="fg-color z-50 mx-auto flex items-center">
          <div className="mx-2">
            <UIButton
              type="neutral"
              content="edit"
              handle={() => {
                setFormData(currTrack);
                changeMode(Mode.Edit);
              }}
              submit={false}
            />
          </div>
          <div className="mx-2">
            <UIButton
              type="neutral"
              content="new"
              handle={() => {
                setFormData(new Track({ artistName: currTrack.artist }));
                changeMode(Mode.New);
              }}
              submit={false}
            />
          </div>
        </div>
      );
    case Mode.Edit:
      return (
        <Editor
          changeMode={changeMode}
          setCurrTrack={setCurrTrack}
          formData={formData}
          setFormData={setFormData}
          user={user}
        />
      );
    case Mode.New:
      return (
        <Editor
          changeMode={changeMode}
          setCurrTrack={setCurrTrack}
          formData={formData}
          setFormData={setFormData}
          user={user}
        />
      );
  }
}

function getHeader(mode: Mode) {
  switch (mode) {
    case Mode.Standby:
      return "now playing...";
    case Mode.Edit:
      return "remixing...";
    case Mode.New:
      return "dropping...";
  }
}

export default function Artist() {
  const [mode, changeMode] = useState(Mode.Standby);
  const [user, setUser] = useState(new User());
  const [, setLink] = useState("");
  const [formData, setFormData] = useState<Track>(new Track({}));
  const [currTrack, setCurrTrack] = useState<Track>(new Track({}));
  const [isClient, setIsClient] = useState<boolean>(false);
  const boundingBox = useRef<HTMLDivElement>(null);

  const populateUser = async (id: string) => {
    // Convert form data to JSON
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}user/${id}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const body = await response.json();
      const newUser = new User(body);
      return newUser;
    }
    window.location.href = "/login";
    return user;
  };

  useEffect(() => {
    setIsClient(true);
    if (!currTrack.artist) {
      const id = getAuthenticatedUser();
      populateUser(id).then((newUser) => {
        if (newUser.artist !== "") {
          setUser(newUser);
          getTrackInfo(newUser.link).then((ti) => {
            if (ti != "") {
              setCurrTrack(new Track(ti));
            } else {
              setCurrTrack(new Track({ artistName: user.artist }));
            }
          });
        }
      });
    }
  }, []);

  const ratio = 3 / 4;
  return (
    <>
      <div className="min-h-dvh p-4">
        <Header
          left={getHeader(mode)}
          right={`tunetree.xyz/${user.link}`}
          rightLink={user.link}
        />
        <div
          ref={boundingBox}
          className="relative sticky top-0 z-40 mx-auto mt-2 flex flex-col items-center overflow-hidden rounded-2xl"
        >
          {isClient && (
            <Display
              track={mode == Mode.Standby ? currTrack : formData}
              width={boundingBox.current?.clientWidth || 0}
              height={window.innerHeight * ratio}
              setLink={setLink}
              tooltip="this is where your album art will go"
            />
          )}
        </div>
        <div className="fg-color border-t-1 relative z-50 flex w-full justify-center rounded-2xl p-5">
          <EditPanel
            mode={mode}
            changeMode={changeMode}
            setCurrTrack={setCurrTrack}
            currTrack={currTrack}
            formData={formData}
            setFormData={setFormData}
            user={user}
          />
        </div>
      </div>
    </>
  );
}
