import { useState, useEffect} from 'react';

import { Password, Message, Header } from './login'
import { validPassword, encodeArtistLink } from '../utils/utils'
import { spotifySearch } from '../utils/spotify';
import { UIButton } from './index';


export const UIPaths = ["login", "signup", "artist", "about", "track", "settings", "admin"]

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
    if (name == "artist" && !separateLink) {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        "link": encodeArtistLink(value)
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      return;
    }
    if (UIPaths.some((path) => path == formData.link)) {
      setMessage("Link " + formData.link + " is already taken.")
      return;
    }
    const validUrlPath = /^[a-zA-Z0-9\-_\.~]+$/
    const res = validUrlPath.test(formData.link);
    if (!res) {
      setMessage("Invalid link");
      return
    }

    // Convert form data to JSON    
    const jsonData = JSON.stringify(formData);
    let responseBody = "";
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'signup/', {
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
  }, [formData])

  return (
    <div className="h-screen flex flex-col">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-200 w-11/12 py-4 md:w-3/5 md:py-8 rounded-lg">
        <div className="w-11/12 md:w-5/6 mx-auto">
          <Header msg="Signing up..."/>
          <Message content={message}/>
          <form onSubmit={handleSubmit} className="flex flex-col my-4">
            <input className="w-full rounded-lg p-1 mb-2"
                   type="text"
                   name="artist"
                   placeholder="artist name"
                   value={formData.artist}
                   onChange={handleChange}/>
            <div className="mb-2">Your link will look like:</div>
            <div className="flex">
              <span className="w-fit rounded-l-lg mb-2 pl-2 bg-slate-200 cursor-not-allowed inline mx-0" >tunetree.xyz/</span>
              <input name="link" type="text" 
                     className={separateLink ? "w-full rounded-r-lg mb-2 mx-0 inline" : "w-full rounded-r-lg mb-2 mx-0 bg-slate-200 cursor-not-allowed inline"}
                     value={formData.link}
                     onChange={handleChange}
                     readOnly={!separateLink}/>
            </div>
            <UIButton type="neutral"
                      content={separateLink ? "Want a custom link?": "Want a separate link?"}
                      submit={false} 
                      handle={ (e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.preventDefault();
                                  setSeparateLink(!separateLink);
                                  if (separateLink) {
                                    setFormData(prevState => ({
                                      ...prevState,
                                      "link": encodeArtistLink(formData.artist)
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

            <Password password={formData.password} setPassword={(password: string) => {
              setFormData({
                ...formData,
                password: password
              })
            }} name="password"/>
            <Password password={formData.cpassword} setPassword={(cpassword: string) => {
              setFormData({
                ...formData,
                cpassword: cpassword
              })
            }} name="cpassword"/>
            <UIButton type="confirm" content="Submit" submit={true} handle={() => {}}/>
          </form>
        </div>
      </div>
    </div>
  );
}
