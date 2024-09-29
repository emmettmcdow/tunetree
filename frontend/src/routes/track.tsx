import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { iconForService } from '../util';

export function SongInfo({trackInfo}: {trackInfo: any}) {
  return (
    <div className="flex flex-col items-center mx-auto">
      <p className="text-4xl"><b>{trackInfo.artist}</b></p>
      <img alt="album-art" src={trackInfo.image} className="w-52 my-2"/>
      <p className="text-2xl">{trackInfo.name}</p>
    </div>
  );
}
function ButtonBox({trackInfo, togglePrompt}: {trackInfo: any, togglePrompt: Function}) {
  // TODO: fix display for <3 items
  let providers = ["spotify", "apple", "youtube", "bandcamp", "amazon", "tidal"];
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
      <img  alt={alt} src={iconForService(provider)} />
    </button>
  );
}

function SubscriptionPrompt({trackInfo, visible, toggle}: {trackInfo: any, visible: boolean, toggle: Function}) {
  if (visible) {
    return (
      <div className="z-50 absolute w-3/4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  bg-indigo-200 p-5">
        <p>wanna be notified when {trackInfo.artist} drops? (it's free)</p>
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

// TODO: fix this any?
function TrackInfo({trackInfo, togglePrompt}: {trackInfo: any, togglePrompt: Function}) {
  if (trackInfo) {
    return (
        <div className="flex flex-col justify-evenly p-5 min-h-screen">
          <SongInfo trackInfo={trackInfo} />
          <ButtonBox trackInfo={trackInfo} togglePrompt={togglePrompt}/>
        </div>

    );
  } else {
    return (<></>);
  }
}

async function getTrackInfo(artist: string) {  
  try {
    // TODO: switch to https
    // TODO: switch away from localhost
    const response = await fetch('http://localhost:81/track/' + artist + '/', {
      method: 'GET'
    });

    if (response.ok && response.body) {
      const body = await response.json()
      return body
    } else {
      console.error('Failed to GET: ' + response.body);
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return ""
}

export async function loader({ params }: { params: any }) {
  const artistName = params.artistName;
  const trackInfo = await getTrackInfo(artistName)
  const merged = {...trackInfo, "artist": artistName}
  return merged;
}

export default function TrackPage() {
  const tInfo = useLoaderData();
  
  const [visibleSubsPrompt, togglePrompt] = useState(false);
  const [trackInfo, setTrackInfo] = useState(tInfo)
  
  return (
      <>
        <TrackInfo trackInfo={trackInfo} togglePrompt={togglePrompt}/>
        <SubscriptionPrompt trackInfo={trackInfo} visible={visibleSubsPrompt} toggle={togglePrompt}/>
      </>
  );
}
