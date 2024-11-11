import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import Image from 'next/image';
import {FiX} from 'react-icons/fi';

import { getAuthenticatedArtistLink, getAuthorizationHeader, iconForService } from "../utils/utils"
import { spotifyGetArt } from '../utils/spotify';
import { getTrackInfo } from './[track]';
import { Header, Message } from './login';
import UIButton from "@/components/uibutton";
import Display from '@/components/display';

function ServiceSelectorBar({selected, setSelected}: {selected: Selected, setSelected: React.Dispatch<React.SetStateAction<Selected>>}) { 
  const buttons = [];
  for (const [provider, state] of Object.entries(selected)) {
    if (!state) {    
      const alt = provider + "-icon";
      buttons.push(
        <button className="text-xl cursor-pointer bounce-button mx-2" key={provider} onClick={() => {
          const newSelected: Selected = {
            ...selected,
            [provider]: true
          };
          setSelected(newSelected);
        }}>
          <Image className="w-8 bounce-text" alt={alt} src={iconForService(provider)} height="1024" width="1024"/>
        </button>
      );
    }
  }
  return (
    <div className="flex my-2">
      <div className="flex justify-start w-1/4 items-center">
        <p className="text-xl"> Add: </p>
      </div>
      <div className="flex justify-evenly my-2 w-3/4">
        {buttons}
      </div>
    </div>
  );
}

function ServiceURLs({formData, setFormData, selected, setSelected}: {formData: Track, setFormData: React.Dispatch<React.SetStateAction<Track>>, selected: Selected, setSelected: React.Dispatch<React.SetStateAction<Selected>>}) { 
  const serviceURLs = [];
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name == "message") {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    } else if (name == "spotify"){
      const plainURL= value.split("?")[0];
      const albumID = plainURL.substring(plainURL.lastIndexOf("/") + 1);
      const [ albumURL, albumName ] = await spotifyGetArt(albumID);
      setFormData(prevState => ({
        ...prevState,
        'image': albumURL,
        'name': albumName,
        "links": {
          ...prevState["links"],
          [name]: value,
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        "links": {
          ...prevState["links"],
          [name]: value,
        }
      }));
    }
  };
  for (const [provider, state] of Object.entries(selected)) {
    if (state) {
      const typedProv = provider as "apple" | "amazon" | "spotify" | "tidal" | "bandcamp";
      serviceURLs.push(
        <div className="flex mb-2" key={provider}>
          <input className="w-full rounded-lg p-1 pr-10 text-black" type="text" name={provider}  value={formData.links[typedProv]} onChange={handleChange} placeholder={provider.charAt(0).toUpperCase() + provider.slice(1) + " URL"}/>
          <span className="flex justify-around items-center cursor-pointer" onClick={() => {
            const newSelected: Selected= {
              ...selected,
              [provider]: false
            };
            setSelected(newSelected);
            setFormData({
              ...formData,
              links: {
                ...formData.links,
                [provider]: ""
              }
            })
          }}>
            <FiX className="absolute mr-10 text-black" size={25}/>
          </span>
        </div>
      );
    }
  }
  return (
    <>
      {serviceURLs}
    </>
  );
}

type Selected = {
  apple: boolean;
  spotify: boolean;
  youtube: boolean;
  tidal: boolean;
  amazon: boolean;
  bandcamp: boolean;
}


function Editor({changeMode, setCurrTrack, formData, setFormData}: {changeMode: Dispatch<SetStateAction<Mode>>, setCurrTrack: Dispatch<SetStateAction<Track>>, formData: Track, setFormData: Dispatch<SetStateAction<Track>>}) {
  const initialState: Selected = {
    "apple": formData.links.apple != "",
    "spotify": formData.links.spotify != "",
    "youtube": formData.links.youtube != "",
    "tidal": formData.links.tidal != "",
    "amazon": formData.links.amazon != "",
    "bandcamp": formData.links.bandcamp != ""
  }
  const [selected, setSelected] = useState(initialState);
  const [message, setMessage] = useState("");
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, setMessage: Dispatch<SetStateAction<string>>) => {
    event.preventDefault();

    // Convert form data to JSON
    const jsonData = JSON.stringify(formData);
    let responseBody = "";
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'track/' + getAuthenticatedArtistLink() + "/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": getAuthorizationHeader()
        },
        body: jsonData,
        credentials: "include"
      });

      if (response.ok) {
        setCurrTrack(formData)
        changeMode(Mode.Standby);
      } else {
        responseBody = await response.text()
        switch(response.status) {
        case (401):
          // Un-authorized
          window.location.href = "/login"
          break;
        case (400):
          // Bad Request
          setMessage(responseBody)
          break;
        case (405):
          // Method not allowed
          throw new Error(responseBody)
        case (500):
          // Internal error
          throw new Error(responseBody)
        default:
            throw new Error("Unhandled response(" + response.status + "): " + responseBody)
        }
      }
    } catch (error) {
      // Handle network or other errors
      setMessage("Something has gone critically wrong: " + error)
    }
  };

  return (
    <div className="flex flex-col mx-auto z-40">
      <Message content={message}/>
      <form onSubmit={(e) => handleSubmit(e, setMessage)} className="flex-col items-center">
        <ServiceSelectorBar selected={selected} setSelected={setSelected}/>
        <ServiceURLs formData={formData} setFormData={setFormData} selected={selected} setSelected={setSelected}/>
        <textarea  className="w-full rounded-lg p-1 my-2" value={formData["message"]} onChange={(e) => {
          const newTrack: Track= {
            ...formData,
            message: e.target.value,
          };
          setFormData(newTrack);
        }} name="message" placeholder="A message to your fans"/>
        <div className="flex justify-center">
          <UIButton type="deny" content="Cancel" handle={() => {changeMode(Mode.Standby)}} submit={false}/>
          <UIButton type="confirm" content="Submit" handle={() => {}} submit={true}/>
        </div>
      </form>
    </div>
  );
}
enum Mode {
  Standby = 1,
  Edit,
  New,
}

function EditPanel({mode, changeMode, currTrack, setCurrTrack, formData, setFormData}: {mode: Mode, changeMode: Dispatch<SetStateAction<Mode>>, currTrack: Track, setCurrTrack: Dispatch<SetStateAction<Track>>, formData: Track, setFormData: Dispatch<SetStateAction<Track>>}) {
  switch(mode) {
    case Mode.Standby:
      return (
        <div className="flex items-center mx-auto fg-color z-50">
          <UIButton type="neutral" content="Edit" handle={() => {
            setFormData(currTrack);
            changeMode(Mode.Edit);
          }} submit={false}/>
          <UIButton type="neutral" content="New" handle={() => {
            setFormData(new Track({artist: currTrack.artist}));
            changeMode(Mode.New)
          }} submit={false}/>
        </div>
      );
    case Mode.Edit:
      return <Editor changeMode={changeMode} setCurrTrack={setCurrTrack} formData={formData} setFormData={setFormData} />;
    case Mode.New:
      return <Editor changeMode={changeMode} setCurrTrack={setCurrTrack} formData={formData} setFormData={setFormData} />;
  }
}

function getHeader(mode: Mode) {
  switch(mode){
    case Mode.Standby:
      return "Now Playing..."
    case Mode.Edit:
      return "Remixing..."
    case Mode.New:
      return "Dropping..."
    }
}

// export type Track = {
//   message: string,
//   name: string,
//   artist: string,
//   image: string,
//   links: {
//     apple: string
//     spotify: string
//     youtube: string
//     tidal: string
//     amazon: string
//     bandcamp: string
//   }
// }

export class Track{

  message: string
  name: string
  artist: string
  image: string
  colors: string
  links: {
    apple: string
    spotify: string
    youtube: string
    tidal: string
    amazon: string
    bandcamp: string
  }
  // eslint-disable-next-line
  constructor(data: any) {
    if (Object.hasOwn(data, "track")) {
      this.artist = data['artistName'];
      this.name = data['track']['name'];
      this.message = data['track']['message'];
      this.image = data['track']['image'];
      this.colors = data['track']['colors'];
      this.links = {
        apple: data['track']['links']['apple'] || "",
        spotify: data['track']['links']['spotify'] || "",
        youtube: data['track']['links']['youtube'] || "",
        tidal: data['track']['links']['tidal'] || "",
        amazon: data['track']['links']['amazon'] || "",
        bandcamp: data['track']['links']['bandcamp'] || "",
      }
    } else { 
      this.name = "";
      this.artist = "";
      this.message = "";
      this.image = "";
      this.colors = "";
      this.links = {
        apple: "",
        spotify: "",
        youtube: "",
        tidal: "",
        amazon: "",
        bandcamp: ""
      }
    }
  }
}


export default function Artist() {
  const [mode, changeMode] = useState(Mode.Standby);
  const [formData, setFormData] = useState<Track>(new Track({}));
  const [currTrack, setCurrTrack] = useState<Track>(new Track({}));
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    if (!currTrack.artist) {
      const artistLink = getAuthenticatedArtistLink();
      if (!artistLink) {
        window.location.href = "/login"
      }
      getTrackInfo(artistLink).then((ti) => {
        if (ti != "") { 
          setCurrTrack(new Track(ti));
        }
      })
    }
  })

  const ratio = 3/4;
  return (
    <>
      <div className="p-4">
        <Header msg={getHeader(mode)}/>
        <div className="sticky top-0 flex flex-col items-center rounded-2xl border-2 border-b-0 border-white mx-auto mt-2">
          {isClient && (<Display 
                          track={mode == Mode.Standby ? currTrack : formData}
                          width={window.innerWidth * ratio}
                          height={window.innerHeight * ratio}
                          setLink={()=>{}}/>)}
        </div>
        <div className="relative flex p-5 w-full fg-color rounded-2xl z-50 border-2 border-t-1">
          <EditPanel mode={mode} changeMode={changeMode} setCurrTrack={setCurrTrack} currTrack={currTrack} formData={formData} setFormData={setFormData}/>
        </div>
      </div>
    </>
  );
}
