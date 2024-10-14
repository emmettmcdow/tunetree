import { useState, useEffect} from 'react';

import { Password, Message, Header } from './login'
import { validPassword, encodeArtistLink } from '../util'
import { spotifySearch } from '../spotify';
import { UIButton } from './home';

const prefix = "tunetree.xyz/";

export default function Signup() {
  const [message, setMessage] = useState("");
  const [separateLink, setSeparateLink] = useState(false);

  const [formData, setFormData] = useState({
    artist: '',
    link: 'tunetree.xyz/',
    email: '',
    password: '',
    cpassword: '',
    spotifyId: ''
  });

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    var { name, value } = event.target;
    if (name == "link" && separateLink) {
      if (!value.startsWith(prefix)) {
        value = prefix + value.slice(prefix.length);
      }      
    }
    if (name == "artist" && !separateLink) {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        "link": prefix + encodeArtistLink(value)
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, setMessage: Function) => {
    event.preventDefault();

    // MAKE SURE TO UPDATE THIS ON BACKEND IF YOU CHANGE THIS
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!formData.email.match(emailRegex)) {
      setMessage("Not a valid email");
      return
    }
    if (!validPassword(formData.password)) {
      setMessage("Invalid password. Password must have between 8-64 characters, with one number, one special character, and one capital letter");
      return
    }
    if (formData.password != formData.cpassword) {
      setMessage("Passwords do not match")
      return
    }
    if (formData.artist == "") {
      setMessage("Invalid artist")
      return
    }
    const validUrlPath = /^[a-zA-Z0-9\-_\.~]+$/
    formData.link = formData.link.substring(prefix.length);
    const res = validUrlPath.test(formData.link);
    if (!res) {
      setMessage("Invalid link");
      return
    }

    // Convert form data to JSON    
    const jsonData = JSON.stringify(formData);
    let responseBody = "";
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + 'signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData
      });

      if (response.ok) {
        // TODO: show this to users better
        window.location.href = "/login"
      } else {
        responseBody = await response.text()
        switch(response.status) {
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

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      spotifySearch(formData['artist'], "artist").then( (spotifyId) => {
        setFormData(prevState => ({
          ...prevState,
          'spotifyId': spotifyId
        }));
      })
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [formData['artist']])

  return (
    <div className="h-screen flex flex-col">
      <Header msg="Signing up..."/>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-200 w-3/4 p-4 rounded-lg">
        <p className="text-2xl mb-2">Sign Up</p>
        <Message content={message}/>
        <form onSubmit={(e) => handleSubmit(e, setMessage)} className="flex flex-col mb-2">
          <input className="w-full rounded-lg p-1 mb-2"
                 type="text"
                 name="artist"
                 placeholder="artist name"
                 value={formData.artist}
                 onChange={handleChange}/>
          <div className="mb-2">Your link will look like:</div>
          <input name="link" type="text" 
                 className={separateLink ? "w-full rounded-lg mb-2 pl-2" : "w-full rounded-lg mb-2 pl-2 bg-slate-200 cursor-not-allowed"}
                 value={formData.link}
                 onChange={handleChange}
                 readOnly={!separateLink}/>
          <UIButton type="neutral"
                    content={separateLink ? "I want the default link": "Want a separate link?"}
                    submit={false} 
                    handle={ (e: any) => {
                                e.preventDefault();
                                setSeparateLink(!separateLink);
                                if (!separateLink) {
                                  setFormData(prevState => ({
                                    ...prevState,
                                    "link": prefix + encodeArtistLink(formData.artist)
                                  }));
                                }
                              }
                            }
          />
          <input className="w-full rounded-lg p-1 my-2" 
                 type="text"
                 name="email"
                 placeholder="e-mail address"
                 value={formData.email}
                 onChange={handleChange}/>
          <Password password={formData.password} setPassword={handleChange} name="password"/>
          <Password password={formData.cpassword} setPassword={handleChange} name="cpassword"/>
          <UIButton type="confirm" content="Submit" submit={true} handle={() => {}}/>
        </form>
      </div>
    </div>
  );
}
