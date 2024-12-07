import {FiChevronRight, FiEyeOff} from 'react-icons/fi';
import {FiEye} from 'react-icons/fi';
import {FiAlertCircle} from 'react-icons/fi';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { setAuthenticatedUser } from '../utils/utils';
import UIButton from '@/components/uibutton';
import LightButton from '@/components/lightbutton';

export function Header({left, right, rightLink}: {left?: string, right?: string, rightLink?: string}) {
  return (
      <div className="w-full flex justify-between items-center">
        <span className="text-2xl">
          <Image src="/logo-white.png" alt="tunetree logo" className="w-12 mx-auto inline mr-2" height="1024" width="1024"/>
          {left}
        </span>
        {right &&
          <Link href={rightLink || "/"}>
            <span className="text-md rainbow-svg border rounded-xl px-2">
              {right}
              <FiChevronRight className="inline rainbow-svg"/> 
            </span>
          </Link>
        }
      </div>
  )
}


function Eye({state}: {state: string}) {
  if (state == "text") {
    return (
        <FiEye className="absolute mr-10" size={15}/>
    );
  } else {
    return (
        <FiEyeOff className="absolute mr-10" size={15}/>
    );
  }
}

interface SetPassword {
  (password: string): void;
}

export function Password({name, password, setPassword}: {name: string, password: string, setPassword: SetPassword}) {
  const [type, setType] = useState('password');
  const handleToggle = () => {
   if (type==='password'){
      setType('text')
   } else {
      setType('password')
   }
  }

  return (
    <div className="flex mb-2">
      <input className="w-full rounded-lg p-1 text-black" type={type} name={name} placeholder={name == "cpassword" ? "confirm password" : name} value={password} onChange={(e) => setPassword(e.target.value)}/>
      <span className="flex justify-around items-center cursor-pointer" onClick={handleToggle}>
        <Eye state={type}/>
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
      <FiAlertCircle className="mr-2 text-red-600 inline" size={25}/>
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Convert form data to JSON
    const jsonData = JSON.stringify(formData);
    let responseBody = "";
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + 'login/', {
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 fg-color w-11/12 py-4 md:w-3/5 md:py-8 rounded-lg">
        <div className="w-11/12 md:w-5/6 mx-auto">
          <Header left="Logging In..."/>
          <Message content={message}/>
          <form className="flex flex-col my-4" onSubmit={handleSubmit}>
            <input className="w-full rounded-lg p-1 mb-2 text-black"
                   type="text"
                   name="email"
                   placeholder="username"
                   value={formData.email}
                   onChange={(e) => {
                    const {name, value} = e.target;
                    const newForm = {
                      ...formData,
                      [name]: value
                    }
                    setFormData(newForm);
              }}/>
            <Password password={formData.password} setPassword={(password: string) => {
              setFormData({
                ...formData,
                password: password
              })
            }} name="password"/>
            <UIButton type="confirm" content="Login" submit={true} handle={() => {}}/>
          </form>
          <div><LightButton link="/signup" content="create an account"/></div>
          <div><LightButton link="/help" content="need help?"/></div>
        </div>
      </div>
    </div>
  );
}
