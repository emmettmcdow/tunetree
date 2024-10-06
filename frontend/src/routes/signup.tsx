import { useState, useEffect} from 'react';

import { Password } from './login'
import { spotifySearch, validPassword} from '../util'

export default function Signup() {
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    artist: '',
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
    
    if (!validPassword(formData.password)) {
      setMessage("Invalid password. Password must have between 8-64 characters, with one number, one special character, and one capital letter");
      return
    }

    if (formData.password != formData.cpassword) {
      setMessage("Passwords do not match")
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
  let renderedMessage = (<></>)
  if (message != "") {
    renderedMessage = (
      <div>{message} </div>
    );
  }

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
        {renderedMessage}
        <form onSubmit={(e) => handleSubmit(e, setMessage)}>
          <input className="w-full rounded-lg p-1 mb-2"
                 type="text"
                 name="artist"
                 placeholder="artist name"
                 value={formData.artist}
                 onChange={handleChange}/>
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
