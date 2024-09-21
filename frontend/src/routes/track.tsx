import { useState } from 'react';
import placeholderSquare from "../placeholder-square.png";

function SongInfo() {
  let artist = "Honestus";
  let song = "Work That Back Boy";
  let art = placeholderSquare;

  return (
    <div className="my-5">
      <h1 className="text-4xl">{artist}</h1>
      <img width="250" height="250" alt="album-art" src={art} className="mx-auto my-2"/>
      <h2 className="text-2xl">{song}</h2>
    </div>
  );
}
function ButtonBox({togglePrompt}: {togglePrompt: Function}) {
  let providers = ["spotify", "applemusic", "youtube"];
  let buttons = providers.map(provider => <IconLink provider={provider} key={provider} togglePrompt={togglePrompt}/> );
  return <div id="button-box" className="flex flex-wrap items-center justify-center mx-auto w-full h-full p-10" >{buttons}</div>;
}

function IconLink({ provider, togglePrompt }: { provider: string, togglePrompt: Function}) {
  let alt = provider + "-icon";
  return (
    <button className="mx-5 w-1/5" onClick={(_) => {togglePrompt(true); console.log("prompt toggled");} }>
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

export default function TrackPage() {
  const [visibleSubsPrompt, togglePrompt] = useState(false);
  return (
      <div className="h-screen flex flex-col content-center text-center p-5">
        <SongInfo />
        <ButtonBox togglePrompt={togglePrompt}/>
        <SubscriptionPrompt visible={visibleSubsPrompt} toggle={togglePrompt}/>
      </div>
  );
}
