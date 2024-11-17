import WebGLBackground from '@/components/webgl2';
import Image from 'next/image';

import { Track } from '@/pages/artist';
import {iconForService } from '../utils/utils';

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

function IconLink({ n, m, provider, link, setLink }: { n: number, m: number, provider: string, link: string, setLink: React.Dispatch<React.SetStateAction<string>>}) {
  const alt = provider + "-icon";
  const style = { 
    "--i": String(n),
    "--m": String(m)
  } as React.CSSProperties;
  let className = "cursor-pointer bounce-button";
  if (m < 3) {
    className = "w-24 m-5 cursor-pointer bounce-button";
  }
  return (
    <button className={className}  style={style} onClick={() => {setLink(link);} }>
      <Image  alt={alt} src={iconForService(provider)} className="bounce-text" height="1024" width="1024"/>
    </button>
  );
}

function ButtonBox({trackInfo, setLink}: {trackInfo: Track, setLink: React.Dispatch<React.SetStateAction<string>>}) {
  const providers = Object.entries(trackInfo.links).filter(([, value]) => value != "")
  
  const buttons = providers.map((provider, index) => <IconLink n={index} m={providers.length} provider={provider[0]} key={provider[0]} setLink={setLink} link={provider[1]} /> );
  
  const tan = Math.tan(Math.PI/providers.length);
  let offset = 1;
  const baseClass = "w-52 mx-auto z-30 "
  let className = baseClass + "img-circle"
  if (providers.length < 3) {
    className = baseClass + "flex justify-center";
  } else if (providers.length < 4) {
    offset = 3;
  } else if (providers.length > 5) {
    offset = 0.5;
  }
  const style = {
    "--tan": tan,
    "--rel": offset
  } as React.CSSProperties;
  return (
    <div id="button-box" style={style} className={className} >
      {buttons}
    </div>
  );
}


export default function Display({track, setLink, width, height}: {track: Track, setLink: React.Dispatch<React.SetStateAction<string>>, width: number, height: number}) {
  // Styling
  /*
  const colors = track.colors.split(';').map((color: string) => color.trim());
  const shade = getShadeColor(colors);
  const bg = getBackgroundColor(colors);
  const text = getTextColor(colors);
  const style = {"backgroundColor": bg } as React.CSSProperties; */
  const displayStyle = {"width": width, "height": height};
  
  return (
    <div className={"relative flex flex-col justify-evenly p-5"} style={displayStyle}>
      <div className={"bg-black/30 flex flex-col items-center mx-auto backdrop-blur-md py-2 px-4 rounded-lg z-30"}>
        <p className="text-4xl"><b>{track.artist}</b></p>
        <Image alt="album-art" src={track.image} className="w-52 my-2" height="1024" width="1024"/>
        <p className="text-2xl">{track.name}</p>
      </div>
      <ButtonBox trackInfo={track} setLink={setLink}/>
      <WebGLBackground colors={track.colors.split(';').map((color: string) => color.trim())} image={track.image} scene="vinyl" width={width} height={height}/>
    </div>
  );
}
