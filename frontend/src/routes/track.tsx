import { useState } from 'react';
import placeholderSquare from "../placeholder-square.png";

export function SongInfo() {
  let artist = "Honestus";
  let song = "Work That Back Boy";
  let art = placeholderSquare;

  return (
    <div className="flex flex-col items-center mx-auto">
      <p className="text-4xl"><b>{artist}</b></p>
      <img alt="album-art" src={art} className="w-52 my-2"/>
      <p className="text-2xl">{song}</p>
    </div>
  );
}
function ButtonBox({togglePrompt}: {togglePrompt: Function}) {
  // TODO: fix display for <3 items
  let providers = ["spotify", "applemusic", "youtube", "bandcamp", "deezer", "pandora"];
  let buttons = providers.map((provider, index) => <IconLink n={index} m={providers.length} provider={provider} key={provider} togglePrompt={togglePrompt}/> );
  const tan = Math.tan(Math.PI/providers.length);
  let offset = 1;
  if (providers.length < 4) {
    offset = 3;
  } else if (providers.length > 5) {
    offset = 0.5;
  }
  const style = {
    "--tan": tan,
    "--rel": offset
  } as React.CSSProperties;
  return (
    <div id="button-box" style={style} className="w-52 img-circle mx-auto" >
      {buttons}
    </div>
  );
}

function IconLink({ n, m, provider, togglePrompt }: { n: number, m: number, provider: string, togglePrompt: Function}) {
  let alt = provider + "-icon";
  const style = { 
    "--i": String(n),
    "--m": String(m)
  } as React.CSSProperties;
  return (
    <button className=""  style={style} onClick={(_) => {togglePrompt(true); console.log("prompt toggled");} }>
      <img  alt={alt} src={placeholderSquare} />
    </button>
  );
}

function SubscriptionPrompt({visible, toggle}: {visible: boolean, toggle: Function}) {
  let artist = "Honestus";
  if (visible) {
    return (
      <div className="z-50 absolute w-3/4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  bg-indigo-200 p-5">
        <p>wanna be notified when {artist} drops? (it's free)</p>
        <form className="my-2">
          <input className="w-1/2" name="email"/>
          <button onClick={(_) => toggle(false)} className="mx-2 bg-emerald-500 rounded-lg"><span className="p-4 py-2 text-white">yes</span></button>
        </form>
        <button onClick={(_) => toggle(false)} className="mx-2 bg-indigo-500 rounded-lg"><span className="p-4 py-2 text-white">i just wanna rock(no)</span></button>
      </div>
    );
  } else {
    return null;
  }
}

function TrackInfo({togglePrompt}: {togglePrompt: Function}) {
  return (
      <div className="flex flex-col justify-evenly p-5 min-h-screen">
        <SongInfo />
        <ButtonBox togglePrompt={togglePrompt}/>
      </div>
  );
}

export default function TrackPage() {
  const [visibleSubsPrompt, togglePrompt] = useState(false);
  return (
      <>
        <TrackInfo togglePrompt={togglePrompt}/>
        <SubscriptionPrompt visible={visibleSubsPrompt} toggle={togglePrompt}/>
      </>
  );
}
