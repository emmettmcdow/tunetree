import {Icon} from 'react-icons-kit';
import {eyeOff} from 'react-icons-kit/feather/eyeOff';
import {eye} from 'react-icons-kit/feather/eye';
import { useState } from 'react';

export default function Login() {
  const [password, setPassword] = useState("");
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
    <div className="h-screen flex flex-col">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-200 w-3/4 p-4 rounded-lg">
        <h1 className="text-xl mb-2">Login</h1>
        <form className="flex flex-col mb-2">
          <input className="w-full rounded-lg p-1 mb-2" type="text" name="username" placeholder="username"/>
          <div className="flex mb-2">
            <input className="w-full rounded-lg p-1" type={type} name="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <span className="flex justify-around items-center" onClick={handleToggle}>
              <Icon className="absolute mr-10" icon={icon} size={25}/>
            </span>
          </div>
          <button className="w-full bg-emerald-500 rounded-lg"><span className="p-4 py-2 text-white">login</span></button>
        </form>
        <p><a href="/signup">Forgot your password?</a></p>
        <p>Or create an account<a href="/signup"> here</a></p>
      </div>
    </div>
  );
}
