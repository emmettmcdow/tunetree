import { useState, Dispatch, SetStateAction, useEffect, useRef } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";

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
import AiPrompt from "@/components/aiprompt";
import { Track, User } from "@/model";

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
          className="text-xl cursor-pointer bounce-button mx-2"
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
            className="w-8 bounce-text"
            alt={alt}
            src={iconForService(provider)}
            height="1024"
            width="1024"
          />
        </button>,
      );
    }
  }
  return (
    <div className="flex my-2">
      <div className="flex justify-start w-1/4 items-center">
        <p className="text-xl">add link:</p>
      </div>
      <div className="flex justify-evenly my-2 w-3/4">{buttons}</div>
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
        <div className="flex mb-2" key={provider}>
          <input
            className="w-full rounded-lg p-1 pr-10 text-black shadow-inner font-light-bg-norm"
            type="text"
            name={provider}
            value={formData.links[typedProv]}
            onChange={handleChange}
            placeholder={
              provider.charAt(0).toUpperCase() + provider.slice(1) + " URL"
            }
          />
          <span
            className="flex justify-around items-center cursor-pointer"
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
  const addJob = (job: string) => {
    setJobs([...animJobs, job]);
  };

  let animations = [...ANIMATIONS, ...animJobs];
  function nextAnim(animation: string) {
    const out =
      animations[(animations.indexOf(animation) + 1) % animations.length];
    return out;
  }

  function lastAnim(animation: string) {
    return animations[(animations.indexOf(animation) + 1) % animations.length];
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

  const toggleVisible = () => {
    setAiVisible(!aiVisible);
  };

  return (
    <>
      <div className="flex flex-col mx-auto z-40">
        <Message content={message} />

        <div className="flex justify-between items-center my-2">
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
          <span className="text-xl">change animation</span>
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

        <div className="flex justify-between items-center my-2">
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
          <span className="text-xl">change display</span>
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
          className="flex-col items-center"
        >
          <ServiceSelectorBar selected={selected} setSelected={setSelected} />
          <ServiceURLs
            formData={formData}
            setFormData={setFormData}
            selected={selected}
            setSelected={setSelected}
          />
          <textarea
            className="w-full rounded-lg p-1 my-2 text-black font-light-bg-norm"
            value={formData["message"]}
            onChange={(e) => {
              const newTrack: Track = {
                ...formData,
                message: e.target.value,
              };
              setFormData(newTrack);
            }}
            name="message"
            placeholder="A message to your fans"
          />
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
      <ScrollPrompt target={submitRef} />
      <AiPrompt
        track={formData}
        user={user}
        visible={aiVisible}
        toggleVisible={toggleVisible}
        addJob={addJob}
      />
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
        <div className="flex items-center mx-auto fg-color z-50">
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
      let newUser = new User(body);
      return newUser;
    }
    window.location.href = "/login";
    return user;
  };

  useEffect(() => {
    setIsClient(true);
    if (!currTrack.artist) {
      let id = getAuthenticatedUser();
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
      <div className="p-4">
        <Header
          left={getHeader(mode)}
          right={`tunetree.xyz/${user.link}`}
          rightLink={user.link}
        />
        <div
          ref={boundingBox}
          className="relative sticky top-0 flex flex-col items-center rounded-2xl border-2 border-b-0 border-white mx-auto mt-2 overflow-hidden z-40"
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
        <div className="relative flex p-5 w-full fg-color rounded-2xl z-50 border-2 border-t-1">
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
