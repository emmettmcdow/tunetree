import {Icon} from 'react-icons-kit';
import {eyeOff} from 'react-icons-kit/feather/eyeOff';
import {eye} from 'react-icons-kit/feather/eye';
import { useState } from 'react';

import { Password } from './login'

export default function Signup() {
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  return (
    <div className="h-screen flex flex-col">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-200 w-3/4 p-4 rounded-lg">
        <p className="text-2xl mb-2">Sign Up</p>
        <form>
          <input className="w-full rounded-lg p-1 mb-2" type="text" name="artist" placeholder="artist name"/>
          <input className="w-full rounded-lg p-1 mb-2" type="text" name="email" placeholder="e-mail address"/>
          <Password password={password} setPassword={setPassword} name="password"/>
          <Password password={cPassword} setPassword={setCPassword} name="confirm-password"/>
          <button className="w-full bg-emerald-500 rounded-lg"><span className="p-4 py-2 text-white text-xl">submit</span></button>
        </form>
      </div>
    </div>
  );
}
