import {Icon} from 'react-icons-kit';
import {eyeOff} from 'react-icons-kit/feather/eyeOff';
import {eye} from 'react-icons-kit/feather/eye';
import { useState } from 'react';

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
      <input className="w-full rounded-lg p-1" type={type} name={name} placeholder={name} value={password} onChange={(e) =>setPassword(e)}/>
      <span className="flex justify-around items-center" onClick={handleToggle}>
        <Icon className="absolute mr-10" icon={icon} size={15}/>
      </span>
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

    try {
      // TODO: switch to https
      // TODO: switch away from localhost
      const response = await fetch('http://localhost:81/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
        credentials: "include"
      });

      if (response.ok) {
        // TODO: show this to users better
        console.log('Form submitted successfully');
        window.location.href = "/artist/"
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
      <div>{message}</div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-200 w-3/4 p-4 rounded-lg">
        <h1 className="text-2xl mb-2">Login</h1>
        {renderedMessage}
        <form className="flex flex-col mb-2" onSubmit={(e) => handleSubmit(e, setMessage)}>
          <input className="w-full rounded-lg p-1 mb-2"
                 type="text"
                 name="email"
                 placeholder="username"
                 value={formData.email}
                 onChange={handleChange}/>
          <Password password={formData.password} setPassword={handleChange} name="password"/>
          <input className="w-full bg-emerald-500 rounded-lg text-white" type="submit" value="login"/>
        </form>
        <p><a href="/signup">Forgot your password?</a></p>
        <p>Or create an account<a href="/signup"> here</a></p>
      </div>
    </div>
  );
}
