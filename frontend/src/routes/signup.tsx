import { useState, useEffect} from 'react';

import { Password, Message } from './login'
import { validPassword, encodeArtistLink } from '../util'
import { spotifySearch } from '../spotify';

export default function Signup() {
  const [message, setMessage] = useState("");
  const [separateLink, setSeparateLink] = useState(false);

  const [formData, setFormData] = useState({
    artist: '',
    link: '',
    email: '',
    password: '',
    cpassword: '',
    spotifyId: ''
  });

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
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
    const res = validUrlPath.test(formData.link);
    console.log(formData.link)
    console.log(res);
    if (!res) {
      setMessage("Invalid link");
      return
    }

    // Convert form data to JSON    
    const jsonData = JSON.stringify(formData);

    try {
      // TODO: switch to https
      // TODO: switch away from localhost
      const response = await fetch('http://127.0.0.1:81/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData
      });

      if (response.ok) {
        // TODO: show this to users better
        console.log('Form submitted successfully');
        window.location.href = "/login"
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-200 w-3/4 p-4 rounded-lg">
        <p className="text-2xl mb-2">Sign Up</p>
        <Message content={message}/>
        <form onSubmit={(e) => handleSubmit(e, setMessage)}>
          <input className="w-full rounded-lg p-1 mb-2"
                 type="text"
                 name="artist"
                 placeholder="artist name"
                 value={formData.artist}
                 onChange={handleChange}/>
          <div className="mb-2">Your link will look like:</div>
          <span className="absolute">tunetree.xyz/track/</span>
          <input className={separateLink ? "w-full rounded-lg mb-2 pl-36" : "w-full rounded-lg mb-2 pl-36 bg-slate-200"} name="link" type="text" value={separateLink ? formData.link : encodeArtistLink(formData.artist) } onChange={handleChange}/>
          <button className="w-full bg-indigo-500 rounded-lg text-white mb-2" onClick={ (e) => {
            e.preventDefault();
            setSeparateLink(!separateLink);
            if (!separateLink) {
              setFormData(prevState => ({
                ...prevState,
                "link": encodeArtistLink(formData.artist)
              }));
            }
          }}>{separateLink ? "I want the default link": "Want a separate link?"}</button>
          <input className="w-full rounded-lg p-1 mb-2" 
                 type="text"
                 name="email"
                 placeholder="e-mail address"
                 value={formData.email}
                 onChange={handleChange}/>
          <Password password={formData.password} setPassword={handleChange} name="password"/>
          <Password password={formData.cpassword} setPassword={handleChange} name="cpassword"/>
          <input className="w-full bg-emerald-500 rounded-lg text-white" type="submit"/>
        </form>
      </div>
    </div>
  );
}
