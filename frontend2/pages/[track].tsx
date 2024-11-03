import { useState } from 'react';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Image from 'next/image';

import { Track } from './artist';
import { getAuthenticatedArtistLink, iconForService } from '../utils/utils';
// import ShaderCanvas, { shader } from '../utils/shader';

/*
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
}*/


export function SongInfo({trackInfo, textColor, shadeColor}: {trackInfo: Track, textColor?: string, shadeColor?: string}) {
  if (!textColor) {
    textColor = "black";
  }
  if (!shadeColor) {
    shadeColor = "white";
  }
  const style = {"color": textColor} as React.CSSProperties;
  {/* this is a grody hak to get tailwind to render properly. sigh */}
  if (shadeColor == "white") {
    return (
      <div className={"bg-white/30 flex flex-col items-center mx-auto backdrop-blur-md py-2 px-4 rounded-lg z-50"}>
        <p style={style} className="text-black text-4xl"><b>{trackInfo.artist}</b></p>
        <Image alt="album-art" src={trackInfo.image} className="w-52 my-2"/>
        <p style={style} className="text-2xl">{trackInfo.name}</p>
      </div>
    );
  } else {
    return (
      <div className={"bg-black/30 flex flex-col items-center mx-auto backdrop-blur-md py-2 px-4 rounded-lg z-50"}>
        <p style={style} className="text-4xl"><b>{trackInfo.artist}</b></p>
        <Image alt="album-art" src={trackInfo.image} className="w-52 my-2"/>
        <p style={style} className="text-2xl">{trackInfo.name}</p>
      </div>
    );
  }
    
}
function ButtonBox({trackInfo, setLink}: {trackInfo: Track, setLink: React.Dispatch<React.SetStateAction<string>>}) {
  const providers = Object.entries(trackInfo.links).filter(([, value]) => value != "")
  
  const buttons = providers.map((provider, index) => <IconLink n={index} m={providers.length} provider={provider[0]} key={provider[0]} setLink={setLink} link={provider[1]} /> );
  
  const tan = Math.tan(Math.PI/providers.length);
  let offset = 1;
  const baseClass = "w-52 z-50 mx-auto "
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
      <Image  alt={alt} src={iconForService(provider)} className="bounce-text"/>
    </button>
  );
}

function SubscriptionPrompt({trackInfo, link, toggle}: {trackInfo: Track, link: string, toggle: React.Dispatch<React.SetStateAction<string>>}) {
  if (link) {
    return (
      <div className="z-50 absolute w-3/4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  bg-indigo-200 p-5 z-50">
        <p>{"wanna be notified when "+ trackInfo.artist + " drops? (it's free)"}</p>
        <form className="my-2">
          <input className="w-1/2" name="email"/>
          <a href={link}><button onClick={() => toggle("")} className="mx-2 bg-emerald-500 rounded-lg cursor-pointer bounce-button"><span className="p-4 py-2 text-white bounce-text">Yes</span></button></a>
        </form>
        <a href={link}><button onClick={() => toggle("")} className="mx-2 bg-indigo-500 rounded-lg cursor-pointer bounce-button"><span className="p-4 py-2 text-white bounce-text">I just wanna rock(no)</span></button></a>
      </div>
    );
  } else {
    return null;
  }
}

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

function TrackInfo({trackInfo, setLink}: {trackInfo: Track, setLink: React.Dispatch<React.SetStateAction<string>>}) {

  if (trackInfo.colors) {
    const colors = trackInfo.colors.split(';').map((color: string) => color.trim());
    const shade = getShadeColor(colors);
    const bg = getBackgroundColor(colors);
    const text = getTextColor(colors);
    
    const style = {"backgroundColor": bg } as React.CSSProperties;
    return (
        <div className={"flex flex-col justify-evenly p-5 min-h-screen z-40"} style={style}>
          <SongInfo trackInfo={trackInfo} textColor={text} shadeColor={shade}/>
          <ButtonBox trackInfo={trackInfo} setLink={setLink}/>
        </div>
    );
  } else {
    return (<></>);
  }
}

export async function getTrackInfo(artistLink: string|null) {  
  try {
    let response = null;
    if (!artistLink) {
      response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'track/' + getAuthenticatedArtistLink(), {
        method: 'GET'
      });
    } else {
      response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'track/' + artistLink, {
        method: 'GET'
      });
    }

    if (response.ok && response.body) {
      const body = await response.json()
      return body;
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return ""
}

interface Styles {
  container: React.CSSProperties;
  colorBox: React.CSSProperties;
  square: React.CSSProperties;
  colorCode: React.CSSProperties;
}

function ColorPalette({ trackInfo }: {trackInfo: Track}){
  if (!trackInfo.colors) {
    return (<></>);
  }
  // Split the input string into an array of color codes
  const colors = trackInfo.colors.split(';').map((color: string) => color.trim());

  // Styles for the component
  const styles: Styles = {
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      justifyContent: 'center',
    },
    colorBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    square: {
      width: '100px',
      height: '100px',
      border: '1px solid #ddd',
    },
    colorCode: {
      marginTop: '5px',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      {colors.map((color: string, index: number) => (
        <div key={index} style={styles.colorBox}>
          <div 
            style={{
              ...styles.square,
              backgroundColor: color,
            }}
          />
          <span style={styles.colorCode}>{color}</span>
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps = (async (ctx) => {
  // Fetch data from external API
  const slug = ctx.params!.track as string;
  const trackInfo = await getTrackInfo(slug);
  // Pass data to the page via props
  return { props: { trackInfo } }
}) satisfies GetServerSideProps<{ trackInfo: Track}>
 

export default function TrackPage({trackInfo}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [link, setLink] = useState("")
  const ti = new Track(trackInfo);
  
  return (
      <>
        <TrackInfo trackInfo={ti} setLink={setLink}/>
        <SubscriptionPrompt trackInfo={ti} link={link} toggle={setLink}/>
        <ColorPalette trackInfo={ti}/>
        {/*<WebGLBackground/>*/ }
      </>
  );
}
