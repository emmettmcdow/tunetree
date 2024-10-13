import {Icon} from 'react-icons-kit';
import {x} from 'react-icons-kit/feather/x';
import { useState, Dispatch, SetStateAction, useEffect } from 'react';

import { getAuthenticatedArtistLink, getAuthorizationHeader, iconForService } from "../util"
import { spotifyGetArt } from '../spotify';
import { SongInfo, getTrackInfo } from './track';
import { Message } from './login';

// TODO: lets get rid of 'h{n}' tags
// TODO: wait does that hurt accessibility
// Does abusing form hurt accessibility?

function ServiceSelectorBar({selected, setSelected}: {selected: any, setSelected: Function}) { 
  let buttons = [];
  for (const [provider, state] of Object.entries(selected)) {
    if (!state) {    
      let alt = provider + "-icon";
      buttons.push(
        <button className="text-xl cursor-pointer" key={provider} onClick={(_) => {
          const newSelected = {...selected};
          newSelected[provider] = true;
          setSelected(newSelected);
        }}>
          <img className="w-8" alt={alt} src={iconForService(provider)} />
        </button>
      );
    }
  }
  return (
    <div className="flex">
      <div className="flex justify-start w-1/4 items-center">
        <p className="text-xl"> Add: </p>
      </div>
      <div className="bracket-left"/>
      <div className="flex justify-evenly my-2 w-3/4">
        {buttons}
      </div>
    </div>
  );
}
function ServiceURLs({formData, setFormData, selected, setSelected}: {formData: any, setFormData: any, selected: any, setSelected: Function}) { 
  let serviceURLs = [];
  for (const [provider, state] of Object.entries(selected)) {
    if (state) {    
      serviceURLs.push(
        <div className="flex mb-2" key={provider}>
          <input className="w-full rounded-lg p-1" type="text" name={provider}  value={formData[provider]} onChange={setFormData} placeholder={provider.charAt(0).toUpperCase() + provider.slice(1) + " URL"}/>
          <span className="flex justify-around items-center cursor-pointer" onClick={(_) => {
            const newSelected: any = {...selected};
            newSelected[provider] = false;
            setSelected(newSelected);
          }}>
            <Icon className="absolute mr-10" icon={x} size={25}/>
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


function Editor({changeMode, formData, setFormData}: {changeMode: Function, formData: Track, setFormData: Dispatch<SetStateAction<Track>>}) {
  // Honestly fuck typescript
  const initialState: any = {
    "apple": false,
    "spotify": false,
    "youtube": false,
    "tidal": false,
    "amazon": false,
    "bandcamp": false
  }
  const [selected, setSelected] = useState(initialState);
  const [message, setMessage] = useState("");
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
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, setMessage: Function) => {
    event.preventDefault();

    // Convert form data to JSON
    
    const jsonData = JSON.stringify(formData);
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + 'track/' + getAuthenticatedArtistLink() + "/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": getAuthorizationHeader()
        },
        body: jsonData,
        credentials: "include"
      });

      if (response.ok) {
        // TODO: show this to users better
        changeMode(Mode.Standby);
        // window.location.href = "/artist"
      } else {
        // TODO: better message, highlight problem
        setMessage("Uh oh, failed to submit: " + response.body)
      }
    } catch (error) {
      // Handle network or other errors
      setMessage("Uh oh, failed to submit: " + error)
    }
  };

  return (
    <div className="flex flex-col w-3/4 p-4 rounded-lg mx-auto">
      <Message content={message}/>
      <form onSubmit={(e) => handleSubmit(e, setMessage)}>
        <ServiceSelectorBar selected={selected} setSelected={setSelected}/>
        <ServiceURLs formData={formData} setFormData={handleChange} selected={selected} setSelected={setSelected}/>
        <textarea  className="w-full rounded-lg p-1 mb-2" value={formData["message"]} onChange={(e) => handleChange(e)} name="message" placeholder="A message to your fans"/>
        <button className="text-xl w-full bg-rose-500 rounded-lg cursor-pointer" onClick={(_) => {
          changeMode(Mode.Standby);
        }}>
          <span className="p-4 py-2 text-white">cancel</span>
        </button>
        <input className="text-xl w-full bg-emerald-500 rounded-lg text-white cursor-pointer" type="submit"/>
      </form>
    </div>
  );
}
enum Mode {
  Standby = 1,
  Edit,
  New,
}

function EditPanel({mode, changeMode, formData, setFormData}: {mode: Mode, changeMode: Function, formData: Track, setFormData: any}) {
  switch(mode) {
    case Mode.Standby:
      return (
        <div className="flex h-1/4 items-center">
          <button onClick={() => {changeMode(Mode.Edit)}} className="text-xl w-1/2 h-1/2 m-1 bg-emerald-500 rounded-lg cursor-pointer"><span className="p-4 py-2 text-white">edit</span></button>
          <button onClick={() => {setFormData({}); changeMode(Mode.New)}} className="text-xl w-1/2 h-1/2 m-1 bg-emerald-500 rounded-lg cursor-pointer"><span className="p-4 py-2 text-white">new</span></button>
        </div>
      );
    case Mode.Edit:
      return <Editor changeMode={changeMode} formData={formData} setFormData={setFormData} />;
    case Mode.New:
      return <Editor changeMode={changeMode} formData={formData} setFormData={setFormData} />;
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
  links: {
    apple: string
    spotify: string
    youtube: string
    tidal: string
    amazon: string
    bandcamp: string
  }
  constructor(data: any) {
    this.artist = data['artistName'];
    if (Object.hasOwn(data, "track")) {
      this.name = data['track']['name'];
      this.message = data['track']['message'];
      this.image = data['track']['image'];
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
      this.message = "";
      this.image = "";
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
  useEffect(() => {
    async function populateForm(artistLink: string) {
      const ti = await getTrackInfo(artistLink)
      if (ti != "") { 
        setFormData(ti);
      }
    }
    if (!formData.artist) {
      const artistLink = getAuthenticatedArtistLink();
      if (!artistLink) {
        window.location.href = "/login"
      }
      populateForm(artistLink)
    }
  })
  // TODO: obvi
  return (
    <div className="h-screen flex flex-col p-5">
      <p className="text-2xl rainbow-text">{getHeader(mode)}</p>
      <div className="flex w-3/4 mx-auto rounded-lg">
        <SongInfo trackInfo={formData}/>
      </div>
      <EditPanel mode={mode} changeMode={changeMode} formData={formData} setFormData={setFormData}/>
    </div>
  );
}
