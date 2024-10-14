import {Icon} from 'react-icons-kit';
import {eyeOff} from 'react-icons-kit/feather/eyeOff';
import {eye} from 'react-icons-kit/feather/eye';
import {alertCircle} from 'react-icons-kit/feather/alertCircle';
import { useState } from 'react';
import { setAuthenticatedUser } from '../util';
import { UIButton } from './home';

export function Header({msg}: {msg: string}) {
  return (
      <span className="text-2xl rainbow-text"><img src="/favicon.ico" alt="tunetree logo" className="w-12 mx-auto inline mr-2"/>{msg}</span>
  )
}

export function Password({name, password, setPassword}: {name: string, password: string, setPassword: Function}) {
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState(eyeOff);
  const handleToggle = () => {
   if (type==='password'){
      setIcon(eye);
      setType('text')
   } else {
      setIcon(eyeOff)
      setType('password')
   }
  }

  return (
    <div className="flex mb-2">
      {/* TODO: why tf is the password in the url */}
      <input className="w-full rounded-lg p-1" type={type} name={name} placeholder={name == "cpassword" ? "confirm password" : name} value={password} onChange={(e) =>setPassword(e)}/>
      <span className="flex justify-around items-center cursor-pointer" onClick={handleToggle}>
        <Icon className="absolute mr-10" icon={icon} size={15}/>
      </span>
    </div>
  );
}

export function Message({content}: {content: string}) {
  if (!content) {
    return <></>
  }

  return (
    <div className="rounded-lg outline outline-offset-1 outline-red-400 bg-red-200 p-2 my-2">
      <Icon className="mr-2 text-red-600" icon={alertCircle} size={25}/>
      <span className="text-red-700">{content}</span>
    </div>
  );
}

export default function Login() {
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    artist: '',
    email: '',
    password: ''
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, setMessage: Function) => {
    event.preventDefault();

    // Convert form data to JSON
    const jsonData = JSON.stringify(formData);
    let responseBody = "";
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + 'login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
        credentials: "include"
      });

      if (response.ok) {
        // TODO: show this to users better
        responseBody = await response.json()
        setAuthenticatedUser(responseBody)
        window.location.href = "/artist/"
      } else {
        responseBody = await response.text()
        switch(response.status) {
        case (401):
          // Un-authorized
          setMessage(responseBody)
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
    <div className="h-screen flex flex-col">
      <Header msg="Logging In..."/>      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-200 w-3/4 p-4 rounded-lg">
        <h1 className="text-2xl mb-2">Login</h1>
        <Message content={message}/>
        <form className="flex flex-col mb-2" onSubmit={(e) => handleSubmit(e, setMessage)}>
          <input className="w-full rounded-lg p-1 mb-2"
                 type="text"
                 name="email"
                 placeholder="username"
                 value={formData.email}
                 onChange={handleChange}/>
          <Password password={formData.password} setPassword={handleChange} name="password"/>
          <UIButton type="confirm" content="Login" submit={true} handle={() => {}}/>
        </form>
        <p><a href="/signup">Forgot your password?</a></p>
        <p>Or create an account<a href="/signup"> here</a></p>
      </div>
    </div>
  );
}
