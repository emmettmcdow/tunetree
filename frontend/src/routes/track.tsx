import { useState, useRef, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';

import { Track } from './artist';
import { getAuthenticatedArtistLink, iconForService } from '../util';
import ShaderCanvas, { shader } from '../shader';

function WebGLBackground() {
  const canvasRef = useRef(null)
  let shaderCanvas: ShaderCanvas | null = null;

  
  const fpsLimit = 30;
  let previousDelta = 0;
  function animate(time: number): void {
    // We know shaderCanvas isn't null
    requestAnimationFrame(animate);

    var delta = time - previousDelta;

    if (fpsLimit && delta < 1000 / fpsLimit) {
        return;
    }
    /* your code here */
    shaderCanvas!.render(time);
    previousDelta = time;
  }

  useEffect(() => {
    if (canvasRef != null && canvasRef.current != null) {
      if (shaderCanvas == null) {
        shaderCanvas = new ShaderCanvas(canvasRef.current, shader);
      }
      if (shaderCanvas) {
        animate(0);
      }
    }
  });
  return (
      <canvas id="glcanvas" ref={canvasRef} width={window.innerWidth / 2} height={window.innerHeight / 2} className="w-full h-full absolute top-0 left-0 z-0" />
  );
}


export function SongInfo({trackInfo}: {trackInfo: Track}) {
  return (
    <div className="flex flex-col items-center mx-auto z-50">
      <p className="text-4xl"><b>{trackInfo.artist}</b></p>
      <img alt="album-art" src={trackInfo.image} className="w-52 my-2"/>
      <p className="text-2xl">{trackInfo.name}</p>
    </div>
  );
}
function ButtonBox({trackInfo, setLink}: {trackInfo: Track, setLink: Function}) {
  const providers = Object.entries(trackInfo.links).filter(([_, value]) => value != "")
  
  let buttons = providers.map((provider, index) => <IconLink n={index} m={providers.length} provider={provider[0]} key={provider[0]} setLink={setLink} link={provider[1]} /> );
  
  const tan = Math.tan(Math.PI/providers.length);
  let offset = 1;
  let className = "w-52 img-circle mx-auto z-50"
  if (providers.length < 3) {
    className = "w-52 z-50 flex justify-center mx-auto";
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

function IconLink({ n, m, provider, link, setLink }: { n: number, m: number, provider: string, link: string, setLink: Function}) {
  let alt = provider + "-icon";
  const style = { 
    "--i": String(n),
    "--m": String(m)
  } as React.CSSProperties;
  let className = "cursor-pointer bounce-button";
  if (m < 3) {
    className = "w-24 m-5 cursor-pointer bounce-button";
  }
  return (
    <button className={className}  style={style} onClick={(_) => {setLink(link);} }>
      <img  alt={alt} src={iconForService(provider)} className="bounce-text"/>
    </button>
  );
}

function SubscriptionPrompt({trackInfo, link, toggle}: {trackInfo: any, link: string, toggle: Function}) {
  if (link) {
    return (
      <div className="z-50 absolute w-3/4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  bg-indigo-200 p-5 z-50">
        <p>wanna be notified when {trackInfo.artist} drops? (it's free)</p>
        <form className="my-2">
          <input className="w-1/2" name="email"/>
          <a href={link}><button onClick={(_) => toggle("")} className="mx-2 bg-emerald-500 rounded-lg cursor-pointer bounce-button"><span className="p-4 py-2 text-white bounce-text">Yes</span></button></a>
        </form>
        <a href={link}><button onClick={(_) => toggle("")} className="mx-2 bg-indigo-500 rounded-lg cursor-pointer bounce-button"><span className="p-4 py-2 text-white bounce-text">I just wanna rock(no)</span></button></a>
      </div>
    );
  } else {
    return null;
  }
}

// TODO: fix this any?
function TrackInfo({trackInfo, setLink}: {trackInfo: any, setLink: Function}) {
  if (trackInfo) {
    return (
        <div className="flex flex-col justify-evenly p-5 min-h-screen z-50">
          <SongInfo trackInfo={trackInfo} />
          <ButtonBox trackInfo={trackInfo} setLink={setLink}/>
        </div>
    );
  } else {
    return (<></>);
  }
}

export async function getTrackInfo(artistLink: string|null) {  
  try {
    var response = null
    if (!artistLink) {
      response = await fetch(process.env.REACT_APP_API_URL + 'track/' + getAuthenticatedArtistLink(), {
        method: 'GET'
      });
    } else {
      response = await fetch(process.env.REACT_APP_API_URL + 'track/' + artistLink, {
        method: 'GET'
      });
    }

    if (response.ok && response.body) {
      const body = await response.json()
      return new Track(body)
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return ""
}

export async function loader({ params }: { params: any }) {
  const trackInfo = await getTrackInfo(params.artistName)
  if (trackInfo == "") {
    window.localStorage.href = "/404";
    console.log(404);
  }
  return trackInfo;
}

export default function TrackPage() {
  const tInfo = useLoaderData();
  
  const [link, setLink] = useState("");
  const [trackInfo, setTrackInfo] = useState(tInfo)
  
  return (
      <>
        <TrackInfo trackInfo={trackInfo} setLink={setLink}/>
        <SubscriptionPrompt trackInfo={trackInfo} link={link} toggle={setLink}/>
        <WebGLBackground/>
      </>
  );
}
