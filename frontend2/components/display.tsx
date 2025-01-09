import WebGLBackground from "@/components/webgl2";
import Image from "next/image";

import { Track } from "../model";
import { iconForService } from "../utils/utils";
import Tooltip from "./tooltip";
import Marquee from "./marquee";

/*
function  getShadeColor(colors: Array<string>) {
  const textColor = getTextColor(colors);
  return textColor == "white" ? "black" : "white";
}

function getTextColor(colors: Array<string>) {
  const selected = getBackgroundColor(colors);
  const r = parseInt(selected.substr(0, 2), 16);
  const g = parseInt(selected.substr(2, 2), 16);
  const b = parseInt(selected.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "black" :  "white"
}
function getBackgroundColor(colors: Array<string>) {
  const selected = colors[0];
  return selected;
}
*/

function IconLink({
  n,
  m,
  className,
  provider,
  link,
  setLink,
}: {
  n?: number;
  m?: number;
  className?: string;
  provider: string;
  link: string;
  setLink: React.Dispatch<React.SetStateAction<string>>;
}) {
  const alt = provider + "-icon";
  let style = {} as React.CSSProperties;
  if (typeof n !== "undefined" && typeof m !== "undefined") {
    style = {
      "--i": String(n),
      "--m": String(m),
    } as React.CSSProperties;
    className = "cursor-pointer bounce-button";
    if (m < 3) {
      className = "w-24 m-5 cursor-pointer bounce-button";
    }
  }
  return (
    <button
      className={className}
      style={style}
      onClick={() => {
        setLink(link);
      }}
    >
      <Image
        alt={alt}
        src={iconForService(provider, true)}
        className="bounce-text bright-white-text"
        height="1024"
        width="1024"
      />
    </button>
  );
}

function CircleButtonBox({
  trackInfo,
  setLink,
}: {
  trackInfo: Track;
  setLink: React.Dispatch<React.SetStateAction<string>>;
}) {
  const providers = Object.entries(trackInfo.links).filter(
    ([, value]) => value != "",
  );

  const buttons = providers.map((provider, index) => (
    <IconLink
      n={index}
      m={providers.length}
      provider={provider[0]}
      key={provider[0]}
      setLink={setLink}
      link={provider[1]}
    />
  ));

  const tan = Math.tan(Math.PI / providers.length);
  let offset = 1;
  const baseClass = "w-52 mx-auto z-30 ";
  let className = baseClass + "img-circle";
  if (providers.length < 3) {
    className = baseClass + "flex justify-center";
  } else if (providers.length < 4) {
    offset = 3;
  } else if (providers.length > 5) {
    offset = 0.5;
  }
  const style = {
    "--tan": tan,
    "--rel": offset,
  } as React.CSSProperties;
  return (
    <div style={style} className={className}>
      {buttons}
    </div>
  );
}

export default function Display({
  track,
  setLink,
  width,
  height,
  tooltip,
}: {
  track: Track;
  setLink: React.Dispatch<React.SetStateAction<string>>;
  width: number;
  height: number;
  tooltip?: string;
}) {
  // Styling
  /*
  const colors = track.colors.split(';').map((color: string) => color.trim());
  const shade = getShadeColor(colors);
  const bg = getBackgroundColor(colors);
  const text = getTextColor(colors);
  const style = {"backgroundColor": bg } as React.CSSProperties; */
  const displayStyle = { width: width, height: height };
  switch (track.display) {
    case "minimal":
      const providers = Object.entries(track.links).filter(
        ([, value]) => value != "",
      );
      const buttons = providers.map((provider) => (
        <IconLink
          provider={provider[0]}
          key={provider[0]}
          setLink={setLink}
          link={provider[1]}
          className="bounce-button mx-4 my-2 w-12 md:w-16"
        />
      ));
      return (
        <div className={`relative`} style={displayStyle}>
          <div className="top-1/12 items-left absolute left-0 z-30 flex flex-col justify-normal">
            <Tooltip text={tooltip}>
              <div
                className={
                  "z-30 mt-2 flex items-center rounded-r-lg bg-black/30 px-4 py-2 backdrop-blur-md"
                }
              >
                <Image
                  alt="album-art"
                  src={track.image || "/placeholder.png"}
                  className="m-2 w-16"
                  height="1024"
                  width="1024"
                />
                <div className="flex-1">
                  <Marquee text={track.name + " / "} className="w-30"></Marquee>
                  <Marquee
                    text={track.artist + " / "}
                    className="w-30"
                  ></Marquee>
                </div>
              </div>
            </Tooltip>
            {buttons}
          </div>
          <WebGLBackground
            colors={track.colors
              .split(";")
              .map((color: string) => color.trim())}
            image={track.image}
            scene={track.animation}
            width={width}
            height={height}
          />
        </div>
      );
    case "center-card":
    default:
      return (
        <div className={`relative`} style={displayStyle}>
          <div className="absolute flex h-full w-full flex-col items-center justify-evenly">
            <Tooltip text={tooltip}>
              <div
                className={
                  "z-30 mx-auto flex flex-col items-center rounded-lg bg-black/30 px-4 py-2 backdrop-blur-md"
                }
              >
                <p className="text-4xl">
                  <b>{track.artist}</b>
                </p>
                <Image
                  alt="album-art"
                  src={track.image || "/placeholder.png"}
                  className="my-2 w-52"
                  height="1024"
                  width="1024"
                />
                <p className="font-ui text-2xl">{track.name}</p>
              </div>
            </Tooltip>
            <CircleButtonBox trackInfo={track} setLink={setLink} />
          </div>
          <WebGLBackground
            colors={track.colors
              .split(";")
              .map((color: string) => color.trim())}
            image={track.image}
            scene={track.animation}
            width={width}
            height={height}
          />
        </div>
      );
  }
}
