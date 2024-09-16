import { useState } from 'react';
import placeholderSquare from "../placeholder-square.png";

function SongInfo() {
  let artist = "Honestus";
  let song = "Work That Back Boy";
  let art = placeholderSquare;

  return (
    <div id="song-info">
      <h1 id="artist-header">{artist}</h1>
      <img width="300" height="300" alt="album-art" src={art} />
      <h2 id="song-or-album-title">{song}</h2>
    </div>
  );
}
function ButtonBox({togglePrompt}: {togglePrompt: Function}) {
  let providers = ["spotify", "applemusic", "youtube"];
  let buttons = providers.map(provider => <IconLink provider={provider} key={provider} togglePrompt={togglePrompt}/> );
  return <div id="button-box">{buttons}</div>;
}

function IconLink({ provider, togglePrompt }: { provider: string, togglePrompt: Function}) {
  let alt = provider + "-icon";
  return (
    <button onClick={(_) => {togglePrompt(true); console.log("prompt toggled");} }>
      <img width="100" height="100" alt={alt} src={placeholderSquare} />
    </button>
  );
}

function SubscriptionPrompt({visible, toggle}: {visible: boolean, toggle: Function}) {
  let artist = "Honestus";
  if (visible) {
    return (
      <div id="subscription-prompt">
        <p>wanna be notified when {artist} drops? (it's free)</p>
        <input name="email"/>
        <button onClick={(_) => toggle(false)}>yes</button>
        <button onClick={(_) => toggle(false)}>just take me to the tunes</button>
      </div>
    );
  } else {
    return null;
  }
}

export default function TrackPage() {
  const [visibleSubsPrompt, togglePrompt] = useState(false);
  return (
      <>
        <SongInfo />
        <ButtonBox togglePrompt={togglePrompt}/>
        <SubscriptionPrompt visible={visibleSubsPrompt} toggle={togglePrompt}/>
      </>
  );
}
