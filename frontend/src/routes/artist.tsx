import { SongInfo } from './track';
import {Icon} from 'react-icons-kit';
import {x} from 'react-icons-kit/feather/x';
import { useState } from 'react';

import placeholderSquare from "../placeholder-square.png";
import { iconForService } from "../util"

// TODO: lets get rid of 'h{n}' tags
// TODO: wait does that hurt accessibility
// Does abusing form hurt accessibility?

function ServiceSelectorBar({selected, setSelected}: {selected: any, setSelected: Function}) { 
  let buttons = [];
  for (const [provider, state] of Object.entries(selected)) {
    if (!state) {    
      let alt = provider + "-icon";
      buttons.push(
        <button className="text-xl" key={provider} onClick={(_) => {
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
          <span className="flex justify-around items-center" onClick={(_) => {
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


function Editor({changeMode}: {changeMode: Function}) {
  // Honestly fuck typescript
  const initialState: any = {
    "apple": false,
    "spotify": false,
    "youtube": false,
    "tidal": false,
    "amazon": false,
    "bandcamp": false
  }
  const [formData, setFormData] = useState({
    'message': '',
    'name': '',
    'links': {
      'apple': '',
      "spotify": '',
      "youtube": '',
      "tidal": '',
      "amazon": '',
      "bandcamp": ''
    }
  });
  const [selected, setSelected] = useState(initialState);
  const [message, setMessage] = useState("");
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name == "name" || name == "message") {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
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
    console.log(jsonData);

    try {
      // TODO: switch to https
      // TODO: switch away from localhost
      const response = await fetch('http://127.0.0.1:81/track/honestus/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData
      });

      if (response.ok) {
        // TODO: show this to users better
        console.log('Form submitted successfully');
        changeMode(Mode.Standby);
        // window.location.href = "/artist"
      } else {
        console.error('Form submission failed');
        // TODO: better message, highlight problem
        setMessage("Uh oh, failed to submit: " + response.body)
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle network or other errors
      setMessage("Uh oh, failed to submit: " + error)
    }
  };

  let renderedMessage = (<></>)
  if (message != "") {
    renderedMessage = (
      <div>{message} </div>
    );
  }

  return (
    <div className="flex flex-col w-3/4 p-4 rounded-lg mx-auto">
      {renderedMessage}
      <form onSubmit={(e) => handleSubmit(e, setMessage)}>
        <ServiceSelectorBar selected={selected} setSelected={setSelected}/>
        <ServiceURLs formData={formData} setFormData={handleChange} selected={selected} setSelected={setSelected}/>
        <textarea  className="w-full rounded-lg p-1 mb-2" name="message" placeholder="A message to your fans"/>
        <button className="text-xl w-full bg-rose-500 rounded-lg" onClick={(_) => {
          changeMode(Mode.Standby);
        }}>
          <span className="p-4 py-2 text-white">cancel</span>
        </button>
        <input className="text-xl w-full bg-emerald-500 rounded-lg text-white" type="submit"/>
      </form>
    </div>
  );
}
enum Mode {
  Standby = 1,
  Edit,
  New,
}

function EditPanel({mode, changeMode}: {mode: Mode, changeMode: Function}) {
  switch(mode) {
    case Mode.Standby:
      return (
        <div className="flex h-1/4 items-center">
          <button onClick={() => {changeMode(Mode.Edit)}} className="text-xl w-1/2 h-1/2 m-1 bg-emerald-500 rounded-lg"><span className="p-4 py-2 text-white">edit</span></button>
          <button onClick={() => {changeMode(Mode.New)}} className="text-xl w-1/2 h-1/2 m-1 bg-emerald-500 rounded-lg"><span className="p-4 py-2 text-white">new</span></button>
        </div>
      );
    case Mode.Edit:
      return <Editor changeMode={changeMode}/>;
    case Mode.New:
      return <Editor changeMode={changeMode}/>;
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

export default function Artist() {
  const [mode, changeMode] = useState(Mode.Standby);
  // TODO: obvi
  const todo = {}
  return (
    <div className="h-screen flex flex-col p-5">
      <p className="text-2xl rainbow-text">{getHeader(mode)}</p>
      <div className="flex w-3/4 mx-auto rounded-lg">
        <SongInfo trackInfo={todo}/>
      </div>
      <EditPanel mode={mode} changeMode={changeMode}/>
    </div>
  );
}
